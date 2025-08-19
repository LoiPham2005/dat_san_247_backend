// src/modules/field-availability/entities/field-availability.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SportsField } from '../../sports-fields/entities/sports-fields.entities';

@Entity('field_availabilities')
export class FieldAvailability {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => SportsField, field => field.availabilities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'field_id' })
  field: SportsField;

  @Column({ type: 'int' })
  day_of_week: number; // 0=CN, 1=Thứ 2,...

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'boolean', default: false })
  is_closed: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}
