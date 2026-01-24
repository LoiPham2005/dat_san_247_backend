export enum ConversationType {
    DIRECT = 'DIRECT',                 // 1-1 chat
    GROUP = 'GROUP',                   // Nhóm chat
    SUPPORT = 'SUPPORT',               // Chat hỗ trợ (Customer - Support Team)
    BOOKING = 'BOOKING',               // Chat về booking cụ thể
    VENUE = 'VENUE'                    // Chat về sân (Customer - Owner/VenueStaff)
}

export enum ConversationStatus {
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED',
    CLOSED = 'CLOSED',
    BLOCKED = 'BLOCKED'
}

export enum ParticipantRole {
    OWNER = 'OWNER',                   // Người tạo nhóm
    ADMIN = 'ADMIN',                   // Admin nhóm
    MEMBER = 'MEMBER',                 // Thành viên
    SUPPORT = 'SUPPORT'                // Nhân viên hỗ trợ
}

export enum MessageType {
    TEXT = 'TEXT',                     // Text thuần
    IMAGE = 'IMAGE',                   // Ảnh
    VIDEO = 'VIDEO',                   // Video
    FILE = 'FILE',                     // File đính kèm
    VOICE = 'VOICE',                   // Voice message
    LOCATION = 'LOCATION',             // Vị trí
    BOOKING = 'BOOKING',               // Share booking
    VENUE = 'VENUE',                   // Share venue
    SYSTEM = 'SYSTEM',                 // Thông báo hệ thống
    DELETED = 'DELETED'                // Đã xóa
}

export enum MessageStatus {
    SENDING = 'SENDING',               // Đang gửi
    SENT = 'SENT',                     // Đã gửi
    DELIVERED = 'DELIVERED',           // Đã nhận
    READ = 'READ',                     // Đã đọc
    FAILED = 'FAILED'                  // Gửi thất bại
}

export enum TicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export enum TicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    WAITING_CUSTOMER = 'WAITING_CUSTOMER',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED'
}

export enum TicketCategory {
    BOOKING_ISSUE = 'BOOKING_ISSUE',
    PAYMENT_ISSUE = 'PAYMENT_ISSUE',
    ACCOUNT_ISSUE = 'ACCOUNT_ISSUE',
    VENUE_ISSUE = 'VENUE_ISSUE',
    TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
    COMPLAINT = 'COMPLAINT',
    SUGGESTION = 'SUGGESTION',
    OTHER = 'OTHER'
}

export enum TemplateCategory {
    GREETING = 'GREETING',             // Chào hỏi
    BOOKING = 'BOOKING',               // Về đặt sân
    PAYMENT = 'PAYMENT',               // Về thanh toán
    CANCELLATION = 'CANCELLATION',     // Về hủy sân
    FAQ = 'FAQ',                       // Câu hỏi thường gặp
    CUSTOM = 'CUSTOM'                  // Tùy chỉnh
}
