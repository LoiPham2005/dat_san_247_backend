import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { DiscountCode } from '../../discount-codes/entities/discount-code.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { User } from 'src/modules/auth/entities/user.entity';

@Entity('discount_usage')
@Unique('unique_code_booking', ['codeId', 'bookingId'])
export class DiscountUsage {
  @PrimaryGeneratedColumn({ name: 'usage_id' })
  usageId: number;

  @Column({ name: 'code_id' })
  codeId: number;

  @ManyToOne(() => DiscountCode, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'code_id' })
  discountCode: DiscountCode;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'booking_id' })
  bookingId: number;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'discount_amount' })
  discountAmount: number;

  @CreateDateColumn({ name: 'used_at' })
  usedAt: Date;
}
