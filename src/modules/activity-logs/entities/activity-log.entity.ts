// // =====================================================
// // 16. ACTIVITY_LOG ENTITY
// // =====================================================
// // modules/activity-logs/entities/activity-log.entity.ts
// import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
// import { BaseEntity } from '../../../database/entities/base.entity';
// import { User } from '../../users/entities/user.entity';

// export enum DeviceType {
//   WEB = 'web',
//   IOS = 'ios',
//   ANDROID = 'android',
// }

// @Entity('activity_logs')
// @Index(['userId', 'action'])
// @Index(['entityType', 'entityId'])
// export class ActivityLog extends BaseEntity {
//   @Column({ name: 'user_id', type: 'uuid', nullable: true })
//   userId?: string;

//   @Column({ length: 100 })
//   action: string;

//   @Column({ name: 'entity_type', length: 50, nullable: true })
//   entityType?: string;

//   @Column({ name: 'entity_id', length: 100, nullable: true })
//   entityId?: string;

//   @Column({ name: 'old_values', type: 'json', nullable: true })
//   oldValues?: Record<string, any>;

//   @Column({ name: 'new_values', type: 'json', nullable: true })
//   newValues?: Record<string, any>;

//   @Column({ name: 'ip_address', length: 45, nullable: true })
//   ipAddress?: string;

//   @Column({ name: 'user_agent', length: 500, nullable: true })
//   userAgent?: string;

//   @Column({ name: 'device_type', type: 'enum', enum: DeviceType, nullable: true })
//   deviceType?: DeviceType;

//   @ManyToOne(() => User, { nullable: true })
//   @JoinColumn({ name: 'user_id' })
//   user?: User;
// }
















import { Entity, Column, ManyToOne, JoinColumn, Index, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum DeviceType {
  WEB = 'web',
  IOS = 'ios',
  ANDROID = 'android',
}

export enum ActivityAction {
  // Auth
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',

  // Venue
  VENUE_CREATE = 'venue_create',
  VENUE_UPDATE = 'venue_update',
  VENUE_DELETE = 'venue_delete',
  VENUE_VIEW = 'venue_view',
  VENUE_SEARCH = 'venue_search',

  // Court
  COURT_CREATE = 'court_create',
  COURT_UPDATE = 'court_update',
  COURT_DELETE = 'court_delete',
  COURT_VIEW = 'court_view',

  // Booking
  BOOKING_CREATE = 'booking_create',
  BOOKING_UPDATE = 'booking_update',
  BOOKING_CANCEL = 'booking_cancel',
  BOOKING_CONFIRM = 'booking_confirm',
  BOOKING_CHECKIN = 'booking_checkin',
  BOOKING_CHECKOUT = 'booking_checkout',
  BOOKING_RATE = 'booking_rate',

  // Payment
  PAYMENT_CREATE = 'payment_create',
  PAYMENT_UPDATE = 'payment_update',
  PAYMENT_CONFIRM = 'payment_confirm',
  PAYMENT_REFUND = 'payment_refund',

  // Review
  REVIEW_CREATE = 'review_create',
  REVIEW_UPDATE = 'review_update',
  REVIEW_DELETE = 'review_delete',
  REVIEW_LIKE = 'review_like',

  // Favorite
  FAVORITE_ADD = 'favorite_add',
  FAVORITE_REMOVE = 'favorite_remove',

  // User
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  USER_PROFILE_VIEW = 'user_profile_view',

  // Admin
  ADMIN_ACTION = 'admin_action',
  ADMIN_SETTING = 'admin_setting',
  ADMIN_DELETE = 'admin_delete',

  // System
  SYSTEM_EXPORT = 'system_export',
  SYSTEM_IMPORT = 'system_import',
  SYSTEM_BACKUP = 'system_backup',
}

@Entity('activity_logs')
@Index(['userId', 'action'])
@Index(['entityType', 'entityId'])
@Index(['createdAt'])
@Index(['deviceType'])
export class ActivityLog extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ length: 100 })
  action: string;

  @Column({ name: 'entity_type', length: 50, nullable: true })
  entityType?: string;

  @Column({ name: 'entity_id', length: 100, nullable: true })
  entityId?: string;

  @Column({ name: 'old_values', type: 'json', nullable: true })
  oldValues?: Record<string, any>;

  @Column({ name: 'new_values', type: 'json', nullable: true })
  newValues?: Record<string, any>;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', length: 500, nullable: true })
  userAgent?: string;

  @Column({ name: 'device_type', type: 'enum', enum: DeviceType, nullable: true })
  deviceType?: DeviceType;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ name: 'status', default: 'success' })
  status: 'success' | 'failed';

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string;



  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}