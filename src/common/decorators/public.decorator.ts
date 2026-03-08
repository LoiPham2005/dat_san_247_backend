import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/**
 * Decorator dùng để đánh dấu API có thể truy cập công khai (không cần Token).
 * Thường dùng khi đã cấu hình Global AuthGuard.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
