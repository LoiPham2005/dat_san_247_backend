import { User } from 'src/modules/auth/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity('system_settings')
export class SystemSetting {
  @PrimaryGeneratedColumn({ name: 'setting_id', type: 'bigint', unsigned: true })
  settingId: number;

  @Column({ name: 'setting_key', type: 'varchar', length: 100, unique: true })
  settingKey: string;

  @Column({ name: 'setting_value', type: 'text' })
  settingValue: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'setting_type',
    type: 'enum',
    enum: ['string', 'number', 'boolean', 'json'],
    default: 'string',
  })
  settingType: 'string' | 'number' | 'boolean' | 'json';

  @Column({
    name: 'category',
    type: 'enum',
    enum: ['payment', 'notification', 'booking', 'system'],
    default: 'system',
  })
  category: 'payment' | 'notification' | 'booking' | 'system';

  @Column({ name: 'is_public', type: 'boolean', default: false })
  isPublic: boolean;

  @ManyToOne(() => User, (user) => user.updatedSettings, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
