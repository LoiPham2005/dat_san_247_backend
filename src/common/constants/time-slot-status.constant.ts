// ================================================================
// common/constants/time-slot-status.constant.ts
// Dùng trong: courts/pricing.service.ts, available-slots logic
// KHÔNG có trong DB — đây là computed status trả về cho client
// ================================================================
export enum TimeSlotStatus {
    AVAILABLE = 'AVAILABLE',
    BOOKED = 'BOOKED',
    BLOCKED = 'BLOCKED',    // bị block thủ công bởi owner
    MAINTENANCE = 'MAINTENANCE', // court_maintenance record
    CLOSED = 'CLOSED',     // ngoài giờ mở cửa / venue_schedule_exceptions
    HOLIDAY = 'HOLIDAY',    // holiday_calendar — giá khác nhưng vẫn mở
}
