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
import { AIFraudDetection } from './entities/ai-fraud-detection.entity';
import { AIImageAnalysis } from './entities/ai-image-analysis.entity';
import { AIReviewAnalysis } from './entities/ai-review-analysis.entity';
import { UserPreferencesAI } from './entities/user-preferences-ai.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AIConversation,
            AIMessage,
            AIFeedback,
            AISearchQuery,
            AISearchRanking,
            AIAssistance,
            AISmartNotification,
            AIFraudDetection,
            AIImageAnalysis,
            AIReviewAnalysis,
            UserPreferencesAI,
        ]),
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class AIModule { }
