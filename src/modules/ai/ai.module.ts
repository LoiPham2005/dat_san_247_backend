import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// AI Entities
import { AIConversation } from './entities/ai-conversation.entity';
import { AIMessage } from './entities/ai-message.entity';
import { AISearchQuery } from './entities/ai-search-query.entity';
import { UserBehavior } from './entities/user-behavior.entity';
import { UserPreferencesAI } from './entities/user-preferences-ai.entity';
import { AIAssistance } from './entities/ai-assistance.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AIConversation,
            AIMessage,
            AISearchQuery,
            UserBehavior,
            UserPreferencesAI,
            AIAssistance,
        ]),
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class AIModule { }
