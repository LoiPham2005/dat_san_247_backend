import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { ConversationParticipant } from './entities/participant.entity';
import { ConversationType, ParticipantRole } from '../../common/constants/chat.constant';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Conversation)
        private readonly conversationRepository: Repository<Conversation>,
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(ConversationParticipant)
        private readonly participantRepository: Repository<ConversationParticipant>,
    ) { }

    async createConversation(creatorId: string, data: any) {
        const conversation = this.conversationRepository.create({
            ...data,
            createdBy: creatorId,
        });
        const savedConversation = await this.conversationRepository.save(conversation) as any;

        // Add creator as owner participant
        const participant = this.participantRepository.create({
            conversationId: savedConversation.id,
            userId: creatorId,
            role: ParticipantRole.OWNER,
        });
        await this.participantRepository.save(participant);

        return savedConversation;
    }

    async sendMessage(senderId: string, data: any) {
        const message = this.messageRepository.create({
            ...data,
            senderId,
            status: 'SENT',
        });
        const savedMessage = await this.messageRepository.save(message) as any;

        // Update conversation last message
        await this.conversationRepository.update(data.conversationId, {
            lastMessageId: savedMessage.id,
            lastMessageAt: new Date(),
            lastMessagePreview: data.content?.substring(0, 100),
        });

        return savedMessage;
    }

    async getMyConversations(userId: string) {
        return this.conversationRepository.createQueryBuilder('conversation')
            .innerJoin('conversation.participants', 'participant')
            .where('participant.userId = :userId', { userId })
            .leftJoinAndSelect('conversation.lastMessage', 'lastMessage')
            .orderBy('conversation.lastMessageAt', 'DESC')
            .getMany();
    }

    async getMessages(conversationId: string, limit = 50, offset = 0) {
        return this.messageRepository.find({
            where: { conversationId },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
            relations: ['sender'],
        });
    }
}
