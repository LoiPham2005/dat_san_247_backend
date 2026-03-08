// ================================================================
// common/constants/activity.constant.ts
// Dùng trong: audit_logs.action field + audit-log.interceptor.ts
// ================================================================
export enum ActivityType {
    // Auth
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',

    // Booking
    BOOKING_CREATED = 'BOOKING_CREATED',
    BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
    BOOKING_CANCELLED = 'BOOKING_CANCELLED',
    BOOKING_CHECKIN = 'BOOKING_CHECKIN',
    BOOKING_NO_SHOW = 'BOOKING_NO_SHOW',

    // Payment
    PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    PAYOUT_REQUESTED = 'PAYOUT_REQUESTED',
    PAYOUT_PROCESSED = 'PAYOUT_PROCESSED',

    // Venue
    VENUE_CREATED = 'VENUE_CREATED',
    VENUE_UPDATED = 'VENUE_UPDATED',
    VENUE_APPROVED = 'VENUE_APPROVED',
    VENUE_REJECTED = 'VENUE_REJECTED',
    VENUE_SUSPENDED = 'VENUE_SUSPENDED',

    // User
    USER_UPDATED = 'USER_UPDATED',
    USER_BANNED = 'USER_BANNED',
    KYC_SUBMITTED = 'KYC_SUBMITTED',
    KYC_APPROVED = 'KYC_APPROVED',
    KYC_REJECTED = 'KYC_REJECTED',

    // Review
    REVIEW_POSTED = 'REVIEW_POSTED',
    REVIEW_HIDDEN = 'REVIEW_HIDDEN',

    // Analytics (search_history)
    SEARCH_QUERY = 'SEARCH_QUERY',
    VIEW_VENUE = 'VIEW_VENUE',
    FAVORITE_TOGGLE = 'FAVORITE_TOGGLE',
}
