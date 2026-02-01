export enum AIConversationStatus {
    ACTIVE = 'ACTIVE',
    RESOLVED = 'RESOLVED',
    ESCALATED = 'ESCALATED',
    CLOSED = 'CLOSED'
}

export enum MessageSenderType {
    USER = 'USER',
    AI = 'AI',
    HUMAN_AGENT = 'HUMAN_AGENT'
}

export enum SentimentType {
    POSITIVE = 'POSITIVE',
    NEUTRAL = 'NEUTRAL',
    NEGATIVE = 'NEGATIVE',
    VERY_NEGATIVE = 'VERY_NEGATIVE'
}

export enum RecommendationType {
    VENUE = 'VENUE',
    TIME_SLOT = 'TIME_SLOT',
    PROMOTION = 'PROMOTION',
    SIMILAR_USER = 'SIMILAR_USER'
}

export enum FraudRiskLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export enum FraudActionTaken {
    NONE = 'NONE',
    FLAG = 'FLAG',
    BLOCK = 'BLOCK',
    MANUAL_REVIEW = 'MANUAL_REVIEW'
}

export enum ModerationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    FLAGGED = 'FLAGGED'
}

export enum ContentViolationType {
    EXPLICIT = 'EXPLICIT',
    VIOLENCE = 'VIOLENCE',
    SPAM = 'SPAM',
    COPYRIGHT = 'COPYRIGHT',
    OTHER = 'OTHER'
}

export enum NotificationTrigger {
    PREDICTED_CANCELLATION = 'PREDICTED_CANCELLATION',
    PRICE_DROP = 'PRICE_DROP',
    AVAILABILITY_ALERT = 'AVAILABILITY_ALERT',
    WEATHER_ALERT = 'WEATHER_ALERT',
    PERSONALIZED_OFFER = 'PERSONALIZED_OFFER'
}