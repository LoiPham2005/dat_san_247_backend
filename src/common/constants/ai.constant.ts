export enum BotType {
    CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',     // Bot hỗ trợ khách hàng
    BOOKING_ASSISTANT = 'BOOKING_ASSISTANT',   // Bot hỗ trợ đặt sân
    FAQ_BOT = 'FAQ_BOT',                       // Bot trả lời FAQ
    SALES_BOT = 'SALES_BOT',                   // Bot tư vấn bán hàng
    ONBOARDING_BOT = 'ONBOARDING_BOT'          // Bot hướng dẫn user mới
}

export enum BotStatus {
    ACTIVE = 'ACTIVE',
    TRAINING = 'TRAINING',
    DISABLED = 'DISABLED',
    ERROR = 'ERROR'
}

export enum AIConversationStatus {
    ACTIVE = 'ACTIVE',                    // Đang chat với bot
    HANDOFF_REQUESTED = 'HANDOFF_REQUESTED', // Bot request chuyển human
    HANDOFF_COMPLETED = 'HANDOFF_COMPLETED', // Đã chuyển human
    RESOLVED = 'RESOLVED',                // Giải quyết xong
    ABANDONED = 'ABANDONED'               // User bỏ dở
}

export enum MessageSender {
    USER = 'USER',
    BOT = 'BOT',
    SYSTEM = 'SYSTEM'
}

export enum KnowledgeType {
    FAQ = 'FAQ',                          // Câu hỏi thường gặp
    POLICY = 'POLICY',                    // Chính sách
    GUIDE = 'GUIDE',                      // Hướng dẫn
    VENUE_INFO = 'VENUE_INFO',            // Thông tin sân
    PRICING = 'PRICING',                  // Bảng giá
    CUSTOM = 'CUSTOM'                     // Tùy chỉnh
}

export enum RecommendationType {
    VENUE = 'VENUE',                      // Gợi ý sân
    TIME_SLOT = 'TIME_SLOT',              // Gợi ý khung giờ
    PRICING = 'PRICING',                  // Gợi ý giá tốt
    PROMOTION = 'PROMOTION',              // Gợi ý khuyến mãi
    BUNDLE = 'BUNDLE',                    // Gợi ý combo
    SIMILAR_VENUE = 'SIMILAR_VENUE'       // Sân tương tự
}

export enum RecommendationSource {
    COLLABORATIVE_FILTERING = 'COLLABORATIVE_FILTERING', // User tương tự đã đặt
    CONTENT_BASED = 'CONTENT_BASED',      // Dựa trên preferences
    POPULARITY = 'POPULARITY',            // Sân phổ biến
    PERSONALIZED = 'PERSONALIZED',        // Cá nhân hóa
    HYBRID = 'HYBRID'                     // Kết hợp nhiều phương pháp
}

export enum PricingStrategy {
    DEMAND_BASED = 'DEMAND_BASED',        // Dựa trên cầu
    TIME_BASED = 'TIME_BASED',            // Dựa trên thời gian
    WEATHER_BASED = 'WEATHER_BASED',      // Dựa trên thời tiết
    COMPETITOR_BASED = 'COMPETITOR_BASED', // Dựa trên đối thủ
    HYBRID = 'HYBRID'                     // Kết hợp
}

export enum ForecastGranularity {
    HOURLY = 'HOURLY',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY'
}

export enum FraudType {
    FAKE_BOOKING = 'FAKE_BOOKING',        // Đặt sân giả
    PAYMENT_FRAUD = 'PAYMENT_FRAUD',      // Gian lận thanh toán
    ACCOUNT_ABUSE = 'ACCOUNT_ABUSE',      // Lạm dụng tài khoản
    REVIEW_FRAUD = 'REVIEW_FRAUD',        // Review giả
    REFERRAL_FRAUD = 'REFERRAL_FRAUD',    // Lạm dụng giới thiệu
    PROMO_ABUSE = 'PROMO_ABUSE'           // Lạm dụng khuyến mãi
}

export enum FraudRiskLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export enum FraudStatus {
    FLAGGED = 'FLAGGED',                  // Đã đánh dấu
    UNDER_REVIEW = 'UNDER_REVIEW',        // Đang xem xét
    CONFIRMED = 'CONFIRMED',              // Xác nhận gian lận
    FALSE_POSITIVE = 'FALSE_POSITIVE',    // Nhầm
    RESOLVED = 'RESOLVED'                 // Đã xử lý
}

export enum SentimentType {
    POSITIVE = 'POSITIVE',
    NEUTRAL = 'NEUTRAL',
    NEGATIVE = 'NEGATIVE',
    MIXED = 'MIXED'
}

export enum TrainingDataType {
    CONVERSATION = 'CONVERSATION',        // Cuộc trò chuyện
    QA_PAIR = 'QA_PAIR',                  // Câu hỏi - Trả lời
    USER_FEEDBACK = 'USER_FEEDBACK',      // Feedback từ user
    CORRECTION = 'CORRECTION',            // Sửa lỗi của bot
    EDGE_CASE = 'EDGE_CASE'               // Trường hợp đặc biệt
}

export enum ModelStatus {
    TRAINING = 'TRAINING',
    TESTING = 'TESTING',
    ACTIVE = 'ACTIVE',
    DEPRECATED = 'DEPRECATED',
    FAILED = 'FAILED'
}

export enum ImageAnalysisType {
    VENUE_VERIFICATION = 'VENUE_VERIFICATION', // Xác minh ảnh sân
    FACILITY_DETECTION = 'FACILITY_DETECTION', // Nhận diện tiện ích
    QUALITY_CHECK = 'QUALITY_CHECK',       // Kiểm tra chất lượng ảnh
    CONTENT_MODERATION = 'CONTENT_MODERATION' // Kiểm duyệt nội dung
}
