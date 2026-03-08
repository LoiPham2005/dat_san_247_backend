// ================================================================
// common/constants/events.constant.ts
// EventEmitter2 event names — type-safe, tránh typo
// Dùng trong: *.service.ts (emit) + *.listener.ts (on)
// ================================================================
export const BookingEvents = {
    CONFIRMED: 'booking.confirmed',
    CANCELLED: 'booking.cancelled',
    RESCHEDULED: 'booking.rescheduled',
    CHECKIN: 'booking.checkin',
    NO_SHOW: 'booking.no_show',
    REMINDER: 'booking.reminder',    // fired by cron job
} as const;

export const PaymentEvents = {
    SUCCESS: 'payment.success',
    FAILED: 'payment.failed',
    REFUNDED: 'payment.refunded',
} as const;

export const PayoutEvents = {
    PROCESSED: 'payout.processed',
    REJECTED: 'payout.rejected',
} as const;

export const ReviewEvents = {
    CREATED: 'review.created',
    RESPONDED: 'review.responded',
} as const;

export const StaffEvents = {
    INVITED: 'staff.invited',
    ACCEPTED: 'staff.accepted',
    REMOVED: 'staff.removed',
} as const;
