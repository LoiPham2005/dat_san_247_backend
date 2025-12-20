// =====================================================
// 5. USER ENTITY EXAMPLE
// =====================================================

// modules/users/entities/user.entity.ts
import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  VENUE_OWNER = 'venue_owner',
  CUSTOMER = 'customer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('users')
@Index(['email'])
@Index(['phone'])
@Index(['role', 'status'])
export class User extends BaseEntity {
  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ unique: true, length: 20 })
  phone: string;

  @Column({ name: 'password_hash', length: 255 })
  @Exclude()
  passwordHash: string;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl?: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'phone_verified', default: false })
  phoneVerified: boolean;

  @Column({ name: 'fcm_token', length: 500, nullable: true })
  @Exclude()
  fcmToken?: string;

  @Column({
    name: 'device_type',
    type: 'enum',
    enum: ['ios', 'android', 'web'],
    nullable: true,
  })
  deviceType?: string;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  // Relations will be added here
  // @OneToMany(() => Booking, booking => booking.user)
  // bookings: Booking[];
}
