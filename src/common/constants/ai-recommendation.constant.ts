// =====================================================
// AI RECOMMENDATION CONSTANTS
// =====================================================

export enum RecommendationType {
    VENUE = 'VENUE',
    COURT = 'COURT',
    TIME_SLOT = 'TIME_SLOT',
    PROMOTION = 'PROMOTION',
    SIMILAR_USER = 'SIMILAR_USER',
    TEAM = 'TEAM',
    MATCH_OPPONENT = 'MATCH_OPPONENT',
}

export enum RecommendationAlgorithm {
    COLLABORATIVE_FILTERING = 'COLLABORATIVE_FILTERING',
    CONTENT_BASED = 'CONTENT_BASED',
    HYBRID = 'HYBRID',
    POPULARITY_BASED = 'POPULARITY_BASED',
    LOCATION_BASED = 'LOCATION_BASED',
    TIME_BASED = 'TIME_BASED',
    DEEP_LEARNING = 'DEEP_LEARNING',
}

// =====================================================
// USER BEHAVIOR TRACKING CONSTANTS
// =====================================================

export enum UserActionType {
    VIEW_VENUE = 'VIEW_VENUE',
    SEARCH = 'SEARCH',
    BOOK = 'BOOK',
    FAVORITE = 'FAVORITE',
    UNFAVORITE = 'UNFAVORITE',
    REVIEW = 'REVIEW',
    SHARE = 'SHARE',
    CLICK_PROMOTION = 'CLICK_PROMOTION',
    FILTER_CHANGE = 'FILTER_CHANGE',
    SORT_CHANGE = 'SORT_CHANGE',
    VIEW_COURT = 'VIEW_COURT',
    ADD_TO_CART = 'ADD_TO_CART',
    REMOVE_FROM_CART = 'REMOVE_FROM_CART',
    CHECKOUT_START = 'CHECKOUT_START',
    PAYMENT_COMPLETE = 'PAYMENT_COMPLETE',
    CANCEL_BOOKING = 'CANCEL_BOOKING',
}

// =====================================================
// AI IMAGE MODERATION CONSTANTS
// =====================================================

export enum ModerationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    FLAGGED = 'FLAGGED',
}

export enum ViolationType {
    EXPLICIT = 'EXPLICIT',
    VIOLENCE = 'VIOLENCE',
    SPAM = 'SPAM',
    COPYRIGHT = 'COPYRIGHT',
    FAKE = 'FAKE',
    OTHER = 'OTHER',
}
