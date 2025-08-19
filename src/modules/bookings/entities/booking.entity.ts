// src/modules/bookings/entities/booking.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SportsField } from '../../sports-fields/entities/sports-fields.entities';
import { User } from '../../auth/entities/user.entity';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => SportsField, field => field.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'field_id' })
  field: SportsField;

  @ManyToOne(() => User, user => user.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.UNPAID })
  payment_status: PaymentStatus;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
