export enum ContentType {
    BANNER = 'BANNER',                 // Banner/Slider trang chủ
    BLOG = 'BLOG',                     // Bài viết blog
    NOTIFICATION = 'NOTIFICATION',     // Thông báo hệ thống
    EMAIL_TEMPLATE = 'EMAIL_TEMPLATE', // Mẫu email
    SMS_TEMPLATE = 'SMS_TEMPLATE',     // Mẫu SMS
    PUSH_NOTIFICATION = 'PUSH_NOTIFICATION', // Push notification
    POPUP = 'POPUP',                   // Popup marketing
    PROMOTION = 'PROMOTION',           // Chương trình khuyến mãi
    FAQ = 'FAQ',                       // Câu hỏi thường gặp
    POLICY = 'POLICY',                 // Chính sách (Privacy, Terms...)
    ANNOUNCEMENT = 'ANNOUNCEMENT',     // Thông báo quan trọng
    LANDING_PAGE = 'LANDING_PAGE',     // Landing page marketing
    SEO_META = 'SEO_META'              // SEO metadata
}

export enum ContentStatus {
    DRAFT = 'DRAFT',           // Bản nháp
    SCHEDULED = 'SCHEDULED',   // Đã lên lịch
    PUBLISHED = 'PUBLISHED',   // Đã xuất bản
    ARCHIVED = 'ARCHIVED',     // Đã lưu trữ
    DELETED = 'DELETED'        // Đã xóa (soft delete)
}

export enum TargetAudience {
    ALL = 'ALL',               // Tất cả
    CUSTOMER = 'CUSTOMER',     // Khách hàng
    OWNER = 'OWNER',           // Chủ sân
    STAFF = 'STAFF',           // Nhân viên
    NEW_USER = 'NEW_USER',     // User mới
    VIP = 'VIP',               // VIP member
    INACTIVE = 'INACTIVE'      // User không hoạt động
}

export enum BannerPosition {
    HOME_HERO = 'HOME_HERO',           // Hero section trang chủ
    HOME_MIDDLE = 'HOME_MIDDLE',       // Giữa trang chủ
    VENUE_LIST = 'VENUE_LIST',         // Trang danh sách sân
    VENUE_DETAIL = 'VENUE_DETAIL',     // Trang chi tiết sân
    PROFILE = 'PROFILE',               // Trang profile
    SIDEBAR = 'SIDEBAR'                // Sidebar
}

export enum BannerType {
    IMAGE = 'IMAGE',                   // Ảnh tĩnh
    VIDEO = 'VIDEO',                   // Video
    CAROUSEL = 'CAROUSEL',             // Slider nhiều ảnh
    HTML = 'HTML'                      // HTML custom
}

export enum BlogCategory {
    NEWS = 'NEWS',                     // Tin tức
    GUIDE = 'GUIDE',                   // Hướng dẫn
    TIPS = 'TIPS',                     // Mẹo hay
    PROMOTION = 'PROMOTION',           // Khuyến mãi
    EVENT = 'EVENT',                   // Sự kiện
    INTERVIEW = 'INTERVIEW',           // Phỏng vấn
    REVIEW = 'REVIEW'                  // Đánh giá
}

export enum FAQCategory {
    BOOKING = 'BOOKING',
    PAYMENT = 'PAYMENT',
    CANCELLATION = 'CANCELLATION',
    ACCOUNT = 'ACCOUNT',
    VENUE = 'VENUE',
    GENERAL = 'GENERAL'
}

export enum PolicyType {
    TERMS_OF_SERVICE = 'TERMS_OF_SERVICE',
    PRIVACY_POLICY = 'PRIVACY_POLICY',
    REFUND_POLICY = 'REFUND_POLICY',
    CANCELLATION_POLICY = 'CANCELLATION_POLICY',
    COOKIE_POLICY = 'COOKIE_POLICY',
    COMMUNITY_GUIDELINES = 'COMMUNITY_GUIDELINES'
}

export enum EmailTemplateType {
    WELCOME = 'WELCOME',
    BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
    BOOKING_REMINDER = 'BOOKING_REMINDER',
    PAYMENT_RECEIPT = 'PAYMENT_RECEIPT',
    PASSWORD_RESET = 'PASSWORD_RESET',
    REVIEW_REQUEST = 'REVIEW_REQUEST',
    PROMOTION = 'PROMOTION',
    NEWSLETTER = 'NEWSLETTER',
    CUSTOM = 'CUSTOM'
}

export enum PromotionType {
    FLASH_SALE = 'FLASH_SALE',
    HAPPY_HOUR = 'HAPPY_HOUR',
    WEEKEND_DEAL = 'WEEKEND_DEAL',
    FIRST_BOOKING = 'FIRST_BOOKING',
    REFERRAL = 'REFERRAL',
    SEASONAL = 'SEASONAL',
    BUNDLE = 'BUNDLE'
}
