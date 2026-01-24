import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIBot } from './entities/ai-bot.entity';
import { AIConversation } from './entities/ai-conversation.entity';
import { AIMessage } from './entities/ai-message.entity';

@Injectable()
export class AIService {
    constructor(
        @InjectRepository(AIBot)
        private readonly botRepository: Repository<AIBot>,
        @InjectRepository(AIConversation)
        private readonly conversationRepository: Repository<AIConversation>,
        @InjectRepository(AIMessage)
        private readonly messageRepository: Repository<AIMessage>,
    ) { }

    async findAllBots() {
        return this.botRepository.find({
            where: { status: 'ACTIVE' as any },
        });
    }

    async findBotById(id: string) {
        return this.botRepository.findOne({
            where: { id },
            relations: ['knowledgeBases'],
        });
    }
}
