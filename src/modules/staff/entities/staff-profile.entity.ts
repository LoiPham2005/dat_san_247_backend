// =====================================================
// 2. STAFF_PROFILE ENTITY
// =====================================================
// modules/staff/entities/staff-profile.entity.ts
import { Entity, Column, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum Department {
  CUSTOMER_SERVICE = 'customer_service',
  TECHNICAL = 'technical',
  OPERATIONS = 'operations',
  FINANCE = 'finance',
}

@Entity('staff_profiles')
export class StaffProfile extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ name: 'employee_code', length: 50, unique: true })
  employeeCode: string;

  @Column({ type: 'enum', enum: Department })
  department: Department;

  @Column({ length: 100, nullable: true })
  position?: string;

  @Column({ name: 'hired_date', type: 'date' })
  hiredDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  salary?: number;

  @Column({ type: 'json', nullable: true })
  permissions?: Record<string, any>;

  @Column({ name: 'managed_by', type: 'uuid', nullable: true })
  managedBy?: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => StaffProfile, { nullable: true })
  @JoinColumn({ name: 'managed_by' })
  manager?: StaffProfile;
}
