// // =====================================================
// // 18. HOLIDAY_CALENDAR ENTITY
// // =====================================================
// // modules/holidays/entities/holiday.entity.ts
// import { Entity, Column, Index } from 'typeorm';
// import { BaseEntity } from '../../../database/entities/base.entity';

// @Entity('holiday_calendar')
// @Index(['holidayDate'])
// export class Holiday extends BaseEntity {
//   @Column({ name: 'holiday_date', type: 'date', unique: true })
//   holidayDate: Date;

//   @Column({ name: 'holiday_name', length: 200 })
//   holidayName: string;

//   @Column({ name: 'is_recurring', default: false })
//   isRecurring: boolean;

//   @Column({ name: 'price_multiplier', type: 'decimal', precision: 5, scale: 2, default: 1.5 })
//   priceMultiplier: number;

//   @Column({ name: 'is_active', default: true })
//   isActive: boolean;
// }








import { Entity, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

@Entity('holiday_calendar')
@Index(['holidayDate'])
@Index(['isActive'])
@Index(['isRecurring'])
export class Holiday extends BaseEntity {
  @Column({ name: 'holiday_date', type: 'date', unique: true })
  holidayDate: Date;

  @Column({ name: 'holiday_name', length: 200 })
  holidayName: string;

  @Column({ name: 'is_recurring', default: false })
  isRecurring: boolean;

  @Column({ name: 'price_multiplier', type: 'decimal', precision: 5, scale: 2, default: 1.5 })
  priceMultiplier: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;


}