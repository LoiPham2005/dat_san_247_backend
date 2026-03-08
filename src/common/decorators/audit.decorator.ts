import { SetMetadata } from '@nestjs/common';
import { ActivityType } from '../constants/activity.constant';

export const AUDIT_KEY = 'audit_action';

/**
 * Decorator dùng để ghi log hoạt động của người dùng.
 * @param action Loại hoạt động (ví dụ: ActivityType.LOGIN)
 */
export const Audit = (action: ActivityType) => SetMetadata(AUDIT_KEY, action);
