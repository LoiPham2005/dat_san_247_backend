import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Venue } from '../../venues/entities/venue.entity';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

@Entity('venue_operating_hours')
@Unique('unique_venue_day', ['venueId', 'dayOfWeek'])
export class VenueOperatingHour {
  @PrimaryGeneratedColumn({ name: 'schedule_id' })
  scheduleId: number;

  @Column({ name: 'venue_id' })
  venueId: number;

  @ManyToOne(() => Venue, (venue) => venue.operatingHours, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column({ type: 'enum', enum: DayOfWeek, name: 'day_of_week' })
  dayOfWeek: DayOfWeek;

  @Column({ type: 'time', name: 'opening_time' })
  openingTime: string;

  @Column({ type: 'time', name: 'closing_time' })
  closingTime: string;

  @Column({ type: 'boolean', default: false, name: 'is_closed' })
  isClosed: boolean;

  @Column({ type: 'time', name: 'break_start_time', nullable: true })
  breakStartTime: string;

  @Column({ type: 'time', name: 'break_end_time', nullable: true })
  breakEndTime: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
