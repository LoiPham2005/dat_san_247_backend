export enum ChatType {
    DIRECT = 'DIRECT',
    GROUP = 'GROUP',
    TEAM = 'TEAM',
    VENUE_SUPPORT = 'VENUE_SUPPORT',
    CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT'
}

export enum ChatMemberRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER'
}

export enum MessageType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    FILE = 'FILE',
    AUDIO = 'AUDIO',
    LOCATION = 'LOCATION',
    BOOKING = 'BOOKING',
    VENUE = 'VENUE',
    SYSTEM = 'SYSTEM'
}

export enum MessageStatus {
    SENT = 'SENT',
    DELIVERED = 'DELIVERED',
    READ = 'READ',
    FAILED = 'FAILED'
}

export enum TemplateCategory {
    GREETING = 'GREETING',
    PRICING = 'PRICING',
    AVAILABILITY = 'AVAILABILITY',
    LOCATION = 'LOCATION',
    RULES = 'RULES',
    OTHER = 'OTHER'
}

export enum TicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
    REOPENED = 'REOPENED'
}

export enum TicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export enum TicketCategory {
    BOOKING_ISSUE = 'BOOKING_ISSUE',
    PAYMENT_ISSUE = 'PAYMENT_ISSUE',
    VENUE_ISSUE = 'VENUE_ISSUE',
    USER_ISSUE = 'USER_ISSUE',
    TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
    REFUND_REQUEST = 'REFUND_REQUEST',
    OTHER = 'OTHER'
}


