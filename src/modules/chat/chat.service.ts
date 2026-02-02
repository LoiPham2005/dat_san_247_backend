import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { Conversation } from './entities/conversation.entity';
import { ConversationParticipant } from './entities/participant.entity';
import { Message } from './entities/message.entity';
import { MessageReceipt } from './entities/message-receipt.entity';
import { MessageReaction } from './entities/message-reaction.entity';

import { ChatType, ChatMemberRole, MessageType, MessageStatus } from '../../common/constants/chat.constant';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Conversation)
        private conversationRepo: Repository<Conversation>,
        @InjectRepository(ConversationParticipant)
        private participantRepo: Repository<ConversationParticipant>,
        @InjectRepository(Message)
        private messageRepo: Repository<Message>,
        @InjectRepository(MessageReceipt)
        private receiptRepo: Repository<MessageReceipt>,
        @InjectRepository(MessageReaction)
        private reactionRepo: Repository<MessageReaction>,
        private dataSource: DataSource,
    ) { }

    async createConversation(userId: string, data: {
        type: ChatType;
        name?: string;
        avatarUrl?: string;
        description?: string;
        venueId?: string;
        isTeam?: boolean;
        teamSportType?: string;
        participantIds?: string[];
        partnerId?: string;
    }) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Check if DIRECT conversation already exists
            if (data.type === ChatType.DIRECT && data.partnerId) {
                const existing = await this.conversationRepo
                    .createQueryBuilder('c')
                    .innerJoin('c.participants', 'p1', 'p1.userId = :userId', { userId })
                    .innerJoin('c.participants', 'p2', 'p2.userId = :partnerId', { partnerId: data.partnerId })
                    .where('c.type = :type', { type: ChatType.DIRECT })
                    .getOne();

                if (existing) {
                    await queryRunner.release();
                    return existing;
                }
            }

            const conversation = this.conversationRepo.create({
                type: data.type,
                name: data.name,
                avatarUrl: data.avatarUrl,
                description: data.description,
                createdById: userId,
                isTeam: data.isTeam || false,
                venueId: data.venueId,
            });
            const savedConv = await queryRunner.manager.save(conversation);

            // Add creator as OWNER
            const creator = this.participantRepo.create({
                conversationId: savedConv.id,
                userId: userId,
                role: ChatMemberRole.OWNER,
            });
            await queryRunner.manager.save(creator);

            let totalMembers = 1;

            // Add partner for DIRECT chat
            if (data.partnerId) {
                const partner = this.participantRepo.create({
                    conversationId: savedConv.id,
                    userId: data.partnerId,
                    role: ChatMemberRole.MEMBER,
                });
                await queryRunner.manager.save(partner);
                totalMembers++;
            }

            // Add other participants
            if (data.participantIds && Array.isArray(data.participantIds)) {
                const participants = data.participantIds.map(pId => this.participantRepo.create({
                    conversationId: savedConv.id,
                    userId: pId,
                    role: ChatMemberRole.MEMBER,
                }));
                await queryRunner.manager.save(participants);
                totalMembers += participants.length;
            }

            savedConv.totalMembers = totalMembers;
            await queryRunner.manager.save(savedConv);

            await queryRunner.commitTransaction();
            return savedConv;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async getUserConversations(userId: string) {
        return this.conversationRepo.createQueryBuilder('c')
            .innerJoin('c.participants', 'p', 'p.userId = :userId', { userId })
            .leftJoinAndSelect('c.participants', 'allParticipants')
            .leftJoinAndSelect('allParticipants.user', 'participantUser')
            .orderBy('c.lastMessageAt', 'DESC', 'NULLS LAST')
            .addOrderBy('c.createdAt', 'DESC')
            .limit(100)
            .getMany();
    }

    async getConversationById(conversationId: string, userId: string) {
        const participant = await this.participantRepo.findOne({ where: { conversationId, userId } });
        if (!participant) {
            throw new ForbiddenException('You are not a member of this conversation');
        }

        return this.conversationRepo.findOne({
            where: { id: conversationId },
            relations: ['participants', 'participants.user'],
        });
    }

    async sendMessage(senderId: string, conversationId: string, data: {
        content?: string;
        type?: MessageType;
        mediaUrls?: any;
        bookingId?: string;
        venueId?: string;
        location?: any;
        replyToMessageId?: string;
    }) {
        // Verify sender is a participant
        const participant = await this.participantRepo.findOne({
            where: { conversationId, userId: senderId }
        });
        if (!participant) {
            throw new ForbiddenException('You are not a member of this conversation');
        }

        const message = this.messageRepo.create({
            conversationId,
            senderId,
            content: data.content,
            type: data.type || MessageType.TEXT,
            mediaUrls: data.mediaUrls,
            bookingId: data.bookingId,
            venueId: data.venueId,
            location: data.location,
            replyToMessageId: data.replyToMessageId,
        });

        const savedMessage = await this.messageRepo.save(message);

        // Update conversation metadata
        await this.conversationRepo.update(conversationId, {
            lastMessageId: savedMessage.id,
            lastMessageAt: new Date(),
            totalMessages: () => 'total_messages + 1',
        });

        // Update unread count for other participants
        await this.participantRepo
            .createQueryBuilder()
            .update()
            .set({ unreadCount: () => 'unread_count + 1' })
            .where('conversation_id = :conversationId', { conversationId })
            .andWhere('user_id != :senderId', { senderId })
            .execute();

        return savedMessage;
    }

    async getMessages(conversationId: string, userId: string, limit = 50, offset = 0) {
        const participant = await this.participantRepo.findOne({
            where: { conversationId, userId }
        });
        if (!participant) {
            throw new ForbiddenException('You are not a member of this conversation');
        }

        return this.messageRepo.find({
            where: { conversationId, isDeleted: false },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
            relations: ['sender', 'messageReactions', 'messageReactions.user'],
        });
    }

    async markAsRead(conversationId: string, userId: string, messageId: string) {
        const participant = await this.participantRepo.findOne({
            where: { conversationId, userId }
        });
        if (!participant) {
            throw new ForbiddenException('Not a member');
        }

        // Update participant's last read
        await this.participantRepo.update(
            { conversationId, userId },
            {
                lastReadMessageId: messageId,
                lastReadAt: new Date(),
                unreadCount: 0,
            }
        );

        // Create/update receipt
        await this.receiptRepo.save({
            messageId,
            userId,
            status: MessageStatus.READ,
            readAt: new Date(),
        });

        return { success: true };
    }

    async reactToMessage(userId: string, messageId: string, emoji: string) {
        // Check if reaction already exists
        const existing = await this.reactionRepo.findOne({
            where: { messageId, userId, emoji }
        });

        if (existing) {
            // Remove reaction (toggle)
            await this.reactionRepo.remove(existing);
            return { action: 'removed' };
        }

        // Add reaction
        await this.reactionRepo.save({
            messageId,
            userId,
            emoji,
        });

        return { action: 'added' };
    }

    async deleteMessage(messageId: string, userId: string, forEveryone = false) {
        const message = await this.messageRepo.findOne({ where: { id: messageId } });
        if (!message) {
            throw new NotFoundException('Message not found');
        }

        if (message.senderId !== userId) {
            throw new ForbiddenException('You can only delete your own messages');
        }

        if (forEveryone) {
            message.deletedForEveryone = true;
        }
        message.isDeleted = true;
        message.deletedAt = new Date();

        await this.messageRepo.save(message);
        return { success: true };
    }

    async editMessage(messageId: string, userId: string, newContent: string) {
        const message = await this.messageRepo.findOne({ where: { id: messageId } });
        if (!message) {
            throw new NotFoundException('Message not found');
        }

        if (message.senderId !== userId) {
            throw new ForbiddenException('You can only edit your own messages');
        }

        message.content = newContent;
        message.isEdited = true;
        message.editedAt = new Date();

        await this.messageRepo.save(message);
        return message;
    }
}
