import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// AI Entities
import { AICancellationPrediction } from './entities/ai-cancellation-prediction.entity';
import { AIConversation } from './entities/ai-conversation.entity';
import { AIDemandForecast } from './entities/ai-demand-forecast.entity';
import { AIFeedback } from './entities/ai-feedback.entity';
import { AIFraudDetection } from './entities/ai-fraud-detection.entity';
import { AIImageAnalysis } from './entities/ai-image-analysis.entity';
import { AIMessage } from './entities/ai-message.entity';
import { AIModelMetric } from './entities/ai-model-metric.entity';
import { AIModelVersion } from './entities/ai-model-version.entity';
import { AIPricingPrediction } from './entities/ai-pricing-prediction.entity';
import { AIRecommendation } from './entities/ai-recommendation.entity';
import { AIReviewAnalysis } from './entities/ai-review-analysis.entity';
import { AISearchQuery } from './entities/ai-search-query.entity';
import { AISearchRanking } from './entities/ai-search-ranking.entity';
import { AISmartNotification } from './entities/ai-smart-notification.entity';
import { AITrainingDataset } from './entities/ai-training-dataset.entity';
import { UserBehavior } from './entities/user-behavior.entity';
import { UserPreferencesAI } from './entities/user-preferences-ai.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AICancellationPrediction,
            AIConversation,
            AIDemandForecast,
            AIFeedback,
            AIFraudDetection,
            AIImageAnalysis,
            AIMessage,
            AIModelMetric,
            AIModelVersion,
            AIPricingPrediction,
            AIRecommendation,
            AIReviewAnalysis,
            AISearchQuery,
            AISearchRanking,
            AISmartNotification,
            AITrainingDataset,
            UserBehavior,
            UserPreferencesAI,
        ]),
    ],
    controllers: [],
    providers: [],
    exports: [],
})
export class AIModule { }
