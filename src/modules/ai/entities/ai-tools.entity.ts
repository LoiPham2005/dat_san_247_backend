import { Entity, Column, ManyToOne, JoinColumn, Index, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { Review } from '../../reviews/entities/review.entity';
import { ImageAnalysisType } from '../../../common/constants/ai.constant';

@Entity('ai_analytics')
export class AIAnalytics {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'date' })
    date: Date;

    @Column()
    granularity: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

    @Column({ type: 'jsonb' })
    chatbot: any;

    @Column({ type: 'jsonb' })
    recommendations: any;

    @Column({ name: 'fraud_detection', type: 'jsonb' })
    fraudDetection: any;

    @Column({ type: 'jsonb' })
    pricing: any;

    @Column({ type: 'jsonb' })
    models: any[];

    @Column({ type: 'jsonb' })
    costs: any;

    @CreateDateColumn({ name: 'generated_at' })
    generatedAt: Date;
}

@Entity('ai_search_queries')
export class AISearchQuery {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', nullable: true })
    @Index()
    userId: string;

    @Column()
    query: string;

    @Column()
    intent: string;

    @Column({ type: 'jsonb' })
    entities: any;

    @Column({ name: 'enhanced_query', nullable: true })
    enhancedQuery: string;

    @Column({ name: 'result_count', default: 0 })
    resultCount: number;

    @Column({ name: 'clicked_result_ids', type: 'simple-array', nullable: true })
    clickedResultIds: string[];

    @Column({ name: 'click_position', type: 'simple-array', nullable: true })
    clickPosition: number[];

    @Column({ name: 'user_context', type: 'jsonb', nullable: true })
    userContext: any;

    @Column({ name: 'was_relevant', nullable: true })
    wasRelevant: boolean;

    @Column({ name: 'user_feedback', type: 'text', nullable: true })
    userFeedback: string;

    @CreateDateColumn({ name: 'searched_at' })
    searchedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}

@Entity('ai_image_analyses')
export class AIImageAnalysis {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'image_url' })
    imageUrl: string;

    @Column({ name: 'source_type' })
    sourceType: 'VENUE' | 'REVIEW' | 'CHAT' | 'USER_PROFILE';

    @Column({ name: 'source_id' })
    @Index()
    sourceId: string;

    @Column({
        name: 'analysis_type',
        type: 'enum',
        enum: ImageAnalysisType,
    })
    analysisType: ImageAnalysisType;

    @Column({ type: 'jsonb' })
    labels: any[];

    @Column({ type: 'jsonb' })
    quality: any;

    @Column({ type: 'jsonb', nullable: true })
    moderation: any;

    @Column({ type: 'simple-array', nullable: true })
    facilities: string[];

    @Column({ name: 'model_used' })
    modelUsed: string;

    @CreateDateColumn({ name: 'analyzed_at' })
    analyzedAt: Date;

    @ManyToOne(() => Venue, { nullable: true })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @ManyToOne(() => Review, { nullable: true })
    @JoinColumn({ name: 'review_id' })
    review: Review;
}

@Entity('ai_voice_sessions')
export class AIVoiceSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    @Index()
    userId: string;

    @Column({ name: 'audio_url' })
    audioUrl: string;

    @Column({ name: 'audio_duration' })
    audioDuration: number;

    @Column({ type: 'text' })
    transcript: string;

    @Column({ name: 'transcription_confidence', type: 'float' })
    transcriptionConfidence: number;

    @Column()
    language: string;

    @Column()
    intent: string;

    @Column({ type: 'jsonb' })
    entities: any;

    @Column({ name: 'response_text', type: 'text' })
    responseText: string;

    @Column({ name: 'response_audio_url', nullable: true })
    responseAudioUrl: string;

    @Column({ name: 'stt_model' })
    sttModel: string;

    @Column({ name: 'nlu_model' })
    nluModel: string;

    @Column({ name: 'tts_model', nullable: true })
    ttsModel: string;

    @Column({ name: 'lead_to_action', default: false })
    leadToAction: boolean;

    @Column({ name: 'action_type', nullable: true })
    actionType: string;

    @Column({ name: 'action_result', type: 'jsonb', nullable: true })
    actionResult: any;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
