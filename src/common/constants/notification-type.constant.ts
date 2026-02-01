export enum NotificationType {
    BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
    BOOKING_CANCELLED = 'BOOKING_CANCELLED',
    PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    REVIEW_RECEIVED = 'REVIEW_RECEIVED',
    PROMOTION = 'PROMOTION',
    SYSTEM = 'SYSTEM',
    SOCIAL = 'SOCIAL',     // General social interaction
    TEAM = 'TEAM',         // Team invites, updates
    MATCH = 'MATCH',       // Match finding updates
    FRIEND = 'FRIEND'      // Friend requests
}
