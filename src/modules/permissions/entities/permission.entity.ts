import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

export enum ResourceType {
  VENUE = 'venue',
  BOOKING = 'booking',
  USER = 'user',
  REPORT = 'report',
  REVIEW = 'review',
  PAYMENT = 'payment',
  SYSTEM = 'system'
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  MODERATE = 'moderate'
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('increment')
  permissionId: number;

  @Column({ type: 'enum', enum: ResourceType })
  resource: ResourceType;

  @Column({ type: 'enum', enum: Action })
  action: Action;

  @Column({ unique: true })
  name: string; // Ví dụ: 'venue:create', 'booking:approve'

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];
}