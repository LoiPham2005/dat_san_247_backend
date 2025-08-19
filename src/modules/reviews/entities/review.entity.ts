// src/modules/reviews/entities/review.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { SportsField } from '../../sports-fields/entities/sports-fields.entities';
import { User } from '../../auth/entities/user.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => SportsField, field => field.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'field_id' })
  field: SportsField;

  @ManyToOne(() => User, user => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
