// // =====================================================
// // 17. SETTING ENTITY
// // =====================================================
// // modules/settings/entities/setting.entity.ts
// import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
// import { BaseEntity } from '../../../database/entities/base.entity';
// import { User } from '../../users/entities/user.entity';

// export enum SettingType {
//   STRING = 'string',
//   NUMBER = 'number',
//   BOOLEAN = 'boolean',
//   JSON = 'json',
// }

// @Entity('settings')
// @Index(['settingKey'])
// export class Setting extends BaseEntity {
//   @Column({ name: 'setting_key', unique: true, length: 100 })
//   settingKey: string;

//   @Column({ name: 'setting_value', type: 'text' })
//   settingValue: string;

//   @Column({ name: 'setting_type', type: 'enum', enum: SettingType })
//   settingType: SettingType;

//   @Column({ length: 50, nullable: true })
//   category?: string;

//   @Column({ type: 'text', nullable: true })
//   description?: string;

//   @Column({ name: 'is_public', default: false })
//   isPublic: boolean;

//   @Column({ name: 'updated_by', type: 'uuid', nullable: true })
//   updatedBy?: string;

//   @ManyToOne(() => User, { nullable: true })
//   @JoinColumn({ name: 'updated_by' })
//   updater?: User;
// }















import { Entity, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

export enum SettingCategory {
  GENERAL = 'general',
  PAYMENT = 'payment',
  EMAIL = 'email',
  SMS = 'sms',
  SECURITY = 'security',
  BOOKING = 'booking',
  COMMISSION = 'commission',
  SYSTEM = 'system',
}

@Entity('settings')
@Index(['settingKey'])
@Index(['category'])
@Index(['settingType'])
export class Setting extends BaseEntity {
  @Column({ name: 'setting_key', unique: true, length: 100 })
  settingKey: string;

  @Column({ name: 'setting_value', type: 'text' })
  settingValue: string;

  @Column({ name: 'setting_type', type: 'enum', enum: SettingType })
  settingType: SettingType;

  @Column({ length: 50, nullable: true })
  category?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;



  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater?: User;
}