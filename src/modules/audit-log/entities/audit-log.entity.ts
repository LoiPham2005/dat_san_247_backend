import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn({ name: 'log_id' })
  logId: number;

  @ManyToOne(() => User, (user) => user.auditLogs, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'action', type: 'varchar', length: 100 })
  action: string;

  @Column({ name: 'table_name', type: 'varchar', length: 50, nullable: true })
  tableName?: string | null;

  @Column({ name: 'record_id', type: 'int', nullable: true })
  recordId?: number | null;

  @Column({ name: 'old_values', type: 'json', nullable: true })
  oldValues?: Record<string, any> | null;

  @Column({ name: 'new_values', type: 'json', nullable: true })
  newValues?: Record<string, any> | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string | null;

  @Column({ name: 'session_id', type: 'varchar', length: 255, nullable: true })
  sessionId?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
