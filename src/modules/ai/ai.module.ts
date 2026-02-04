import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// AI Entities
import { AIConversation } from './entities/ai-conversation.entity';
import { AIMessage } from './entities/ai-message.entity';
import { AIFeedback } from './entities/ai-feedback.entity';
import { AISearchQuery } from './entities/ai-search-query.entity';
import { AISearchRanking } from './entities/ai-search-ranking.entity';
import { AIAssistance } from './entities/ai-assistance.entity';
import { AISmartNotification } from './entities/ai-smart-notification.entity';
import { UserPreferencesAI } from './entities/user-preferences-ai.entity';
import { AIRecommendation } from './entities/ai-recommendation.entity';
import { AIModel } from './entities/ai-model.entity';
import { AIInteraction } from './entities/ai-interaction.entity';
import { AIQuota } from './entities/ai-quota.entity';
import { AICache } from './entities/ai-cache.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            // Core Infrastructure
            AIModel,
            AIInteraction,
            AIQuota,
            AICache,
            // Chatbot
            AIConversation,
            AIMessage,
            AIFeedback,
            // Search
            AISearchQuery,
            AISearchRanking,
            // Features
            AIAssistance,
            AISmartNotification,
            UserPreferencesAI,
            AIRecommendation,
        ]),
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class AIModule { }
