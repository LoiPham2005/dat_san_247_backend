// ================================================================
// common/constants/file.constant.ts
// Dùng trong: storage.service.ts để set bucket path, validate mime
// ================================================================
export enum FileCategory {
    AVATAR = 'AVATAR',
    VENUE_IMAGE = 'VENUE_IMAGE',
    COURT_IMAGE = 'COURT_IMAGE',
    REVIEW_IMAGE = 'REVIEW_IMAGE',
    VERIFICATION = 'VERIFICATION',   // business_license, id_card
    BANNER_IMAGE = 'BANNER_IMAGE',
    CONTENT_IMAGE = 'CONTENT_IMAGE',
    PAYOUT_PROOF = 'PAYOUT_PROOF',   // payout_requests.proof_image_url
}

// Max file size per category (bytes)
export const FILE_SIZE_LIMIT: Record<FileCategory, number> = {
    [FileCategory.AVATAR]: 2 * 1024 * 1024,   // 2MB
    [FileCategory.VENUE_IMAGE]: 5 * 1024 * 1024,   // 5MB
    [FileCategory.COURT_IMAGE]: 5 * 1024 * 1024,   // 5MB
    [FileCategory.REVIEW_IMAGE]: 3 * 1024 * 1024,   // 3MB
    [FileCategory.VERIFICATION]: 5 * 1024 * 1024,   // 5MB
    [FileCategory.BANNER_IMAGE]: 3 * 1024 * 1024,   // 3MB
    [FileCategory.CONTENT_IMAGE]: 3 * 1024 * 1024,   // 3MB
    [FileCategory.PAYOUT_PROOF]: 3 * 1024 * 1024,   // 3MB
};

export const ALLOWED_MIME_TYPES = {
    IMAGE: ['image/jpeg', 'image/png', 'image/webp'] as const,
    DOC: ['image/jpeg', 'image/png', 'application/pdf'] as const,
};
