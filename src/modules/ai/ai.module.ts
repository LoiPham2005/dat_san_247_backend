import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIBot } from './entities/ai-bot.entity';
import { AIConversation } from './entities/ai-conversation.entity';
import { AIMessage } from './entities/ai-message.entity';
import { AIKnowledgeBase } from './entities/ai-knowledge-base.entity';
import { AIRecommendation } from './entities/ai-recommendation.entity';
import { AIPricingSuggestion } from './entities/ai-pricing.entity';
import { AIDemandForecast } from './entities/ai-forecast.entity';
import { AIFraudDetection } from './entities/ai-fraud.entity';
import { AISentimentAnalysis } from './entities/ai-sentiment.entity';
import { AITrainingData, AIModel } from './entities/ai-model.entity';
import { AIAnalytics, AISearchQuery, AIImageAnalysis, AIVoiceSession } from './entities/ai-tools.entity';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AIBot,
            AIConversation,
            AIMessage,
            AIKnowledgeBase,
            AIRecommendation,
            AIPricingSuggestion,
            AIDemandForecast,
            AIFraudDetection,
            AISentimentAnalysis,
            AITrainingData,
            AIModel,
            AIAnalytics,
            AISearchQuery,
            AIImageAnalysis,
            AIVoiceSession,
        ]),
    ],
    providers: [AIService],
    controllers: [AIController],
    exports: [AIService],
})
export class AIModule { }
