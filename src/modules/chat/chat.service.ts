import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatType, ChatMemberRole, MessageType, MessageStatus } from '../../common/constants/chat.constant';

@Injectable()
export class ChatService {
    constructor(
        private prisma: PrismaService,
    ) { }

    private mapConversation(conv: any) {
        if (!conv) return null;
        return {
            ...conv,
            createdAt: conv.created_at,
            updatedAt: conv.updated_at,
            lastMessageAt: conv.last_message_at,
            lastMessageId: conv.last_message_id,
            totalMessages: conv.total_messages,
            totalMembers: conv.total_members,
            venueId: conv.venue_id,
            teamId: conv.team_id,
            participants: conv.chat_members ? conv.chat_members.map(m => this.mapParticipant(m)) : undefined,
            messages: conv.chat_messages ? conv.chat_messages.map(m => this.mapMessage(m)) : undefined,
        };
    }

    private mapParticipant(part: any) {
        return {
            ...part,
            userId: part.user_id,
            conversationId: part.conversation_id,
            joinedAt: part.joined_at,
            lastReadAt: part.last_read_at,
            lastReadMessageId: part.last_read_message_id,
            unreadCount: part.unread_count,
            user: part.users ? this.mapUser(part.users) : undefined,
        };
    }

    private mapMessage(msg: any) {
        return {
            ...msg,
            conversationId: msg.conversation_id,
            senderId: msg.sender_id,
            createdAt: msg.created_at,
            replyToMessageId: msg.reply_to_message_id,
            bookingId: msg.booking_id,
            venueId: msg.venue_id,
            mediaUrls: msg.media_urls,
            sender: msg.users ? this.mapUser(msg.users) : undefined,
            reactions: msg.chat_message_reactions ? msg.chat_message_reactions : undefined
        };
    }

    private mapUser(user: any) {
        return {
            ...user,
            id: user.id || user.user_id,
            // Add other user fields as needed
            firstName: user.first_name,
            lastName: user.last_name,
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
        };
    }

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
        // Check existing DIRECT
        if (data.type === ChatType.DIRECT && data.partnerId) {
            const existing = await this.prisma.chat_members.findMany({
                where: {
                    user_id: { in: [userId, data.partnerId] },
                    chat_conversations: { type: 'DIRECT' as any }
                },
                select: { conversation_id: true }
            });

            // Find common conversation_id
            // Naive approach: find conversations where both are members
            const userConvs = await this.prisma.chat_members.findMany({
                where: { user_id: userId, chat_conversations: { type: 'DIRECT' as any } },
                select: { conversation_id: true }
            });
            const partnerConvs = await this.prisma.chat_members.findMany({
                where: { user_id: data.partnerId, chat_conversations: { type: 'DIRECT' as any } },
                select: { conversation_id: true }
            });

            const common = userConvs.find(uc => partnerConvs.some(pc => pc.conversation_id === uc.conversation_id));

            if (common) {
                return this.getConversationById(common.conversation_id, userId);
            }
        }

        return await this.prisma.$transaction(async (tx) => {
            const conv = await tx.chat_conversations.create({
                data: {
                    type: data.type as any,
                    name: data.name,
                    avatar_url: data.avatarUrl,
                    description: data.description,
                    created_by: userId,
                    is_team: data.isTeam || false,
                    venue_id: data.venueId,
                    total_members: 1 + (data.partnerId ? 1 : 0) + (data.participantIds?.length || 0),
                }
            });

            const membersData: any[] = [
                { conversation_id: conv.id, user_id: userId, role: 'OWNER' }
            ];

            if (data.partnerId) {
                membersData.push({ conversation_id: conv.id, user_id: data.partnerId, role: 'MEMBER' });
            }

            if (data.participantIds) {
                data.participantIds.forEach(pid => membersData.push({ conversation_id: conv.id, user_id: pid, role: 'MEMBER' }));
            }

            await tx.chat_members.createMany({ data: membersData });

            return this.mapConversation(conv);
        });
    }

    async getUserConversations(userId: string) {
        const convs = await this.prisma.chat_conversations.findMany({
            where: {
                chat_members: { some: { user_id: userId } }
            },
            include: {
                chat_members: {
                    include: { users: true }
                }
            },
            orderBy: [
                { last_message_at: 'desc' },
                { created_at: 'desc' },
            ],
            take: 100
        });
        return convs.map(c => this.mapConversation(c));
    }

    async getConversationById(conversationId: string, userId: string) {
        const member = await this.prisma.chat_members.findFirst({
            where: { conversation_id: conversationId, user_id: userId }
        });
        if (!member) throw new ForbiddenException('You are not a member of this conversation');

        const conv = await this.prisma.chat_conversations.findUnique({
            where: { id: conversationId },
            include: {
                chat_members: { include: { users: true } }
            }
        });
        return this.mapConversation(conv);
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
        const member = await this.prisma.chat_members.findFirst({
            where: { conversation_id: conversationId, user_id: senderId }
        });
        if (!member) throw new ForbiddenException('Not a member');

        return await this.prisma.$transaction(async (tx) => {
            const message = await tx.chat_messages.create({
                data: {
                    conversation_id: conversationId,
                    sender_id: senderId,
                    content: data.content,
                    type: (data.type || MessageType.TEXT) as any,
                    media_urls: data.mediaUrls,
                    booking_id: data.bookingId,
                    venue_id: data.venueId,
                    location: data.location,
                    reply_to_message_id: data.replyToMessageId,
                },
                include: { users: true } // Return sender info
            });

            await tx.chat_conversations.update({
                where: { id: conversationId },
                data: {
                    last_message_id: message.id,
                    last_message_at: new Date(),
                    total_messages: { increment: 1 }
                }
            });

            // Update unread counts
            await tx.chat_members.updateMany({
                where: {
                    conversation_id: conversationId,
                    user_id: { not: senderId }
                },
                data: {
                    unread_count: { increment: 1 }
                }
            });

            return this.mapMessage(message);
        });
    }

    async getMessages(conversationId: string, userId: string, limit = 50, offset = 0) {
        const member = await this.prisma.chat_members.findFirst({
            where: { conversation_id: conversationId, user_id: userId }
        });
        if (!member) throw new ForbiddenException('Not a member');

        const messages = await this.prisma.chat_messages.findMany({
            where: { conversation_id: conversationId, is_deleted: false },
            orderBy: { created_at: 'desc' },
            take: limit,
            skip: offset,
            include: {
                users: true,
                chat_message_reactions: { include: { users: true } }
            }
        });

        return messages.map(m => this.mapMessage(m));
    }

    async markAsRead(conversationId: string, userId: string, messageId: string) {
        const member = await this.prisma.chat_members.findFirst({
            where: { conversation_id: conversationId, user_id: userId }
        });
        if (!member) throw new ForbiddenException('Not a member');

        await this.prisma.$transaction([
            this.prisma.chat_members.updateMany({
                where: { conversation_id: conversationId, user_id: userId },
                data: {
                    last_read_message_id: messageId,
                    last_read_at: new Date(),
                    unread_count: 0
                }
            }),
            this.prisma.chat_message_receipts.create({
                data: {
                    message_id: messageId,
                    user_id: userId,
                    status: 'READ' as any, // Enum cast
                    read_at: new Date()
                }
            })
        ]);
        return { success: true };
    }

    async reactToMessage(userId: string, messageId: string, emoji: string) {
        const existing = await this.prisma.chat_message_reactions.findFirst({
            where: { message_id: messageId, user_id: userId, emoji }
        });

        if (existing) {
            await this.prisma.chat_message_reactions.delete({ where: { id: existing.id } });
            return { action: 'removed' };
        }

        await this.prisma.chat_message_reactions.create({
            data: { message_id: messageId, user_id: userId, emoji }
        });
        return { action: 'added' };
    }

    async deleteMessage(messageId: string, userId: string, forEveryone = false) {
        const message = await this.prisma.chat_messages.findUnique({ where: { id: messageId } });
        if (!message) throw new NotFoundException('Message not found');

        if (message.sender_id !== userId) throw new ForbiddenException('Not authorized');

        await this.prisma.chat_messages.update({
            where: { id: messageId },
            data: {
                is_deleted: true,
                deleted_at: new Date(), // Soft delete
                deleted_for_everyone: forEveryone
            }
        });
        return { success: true };
    }

    async editMessage(messageId: string, userId: string, newContent: string) {
        const message = await this.prisma.chat_messages.findUnique({ where: { id: messageId } });
        if (!message) throw new NotFoundException('Message not found');
        if (message.sender_id !== userId) throw new ForbiddenException('Not authorized');

        const updated = await this.prisma.chat_messages.update({
            where: { id: messageId },
            data: {
                content: newContent,
                is_edited: true,
                edited_at: new Date()
            },
            include: { users: true }
        });
        return this.mapMessage(updated);
    }
}
