import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';
import { User } from 'src/modules/auth/entities/user.entity';

export enum ReviewReplyStatus {
  ACTIVE = 'active',
  HIDDEN = 'hidden',
  DELETED = 'deleted',
}

@Entity('review_replies')
export class ReviewReply {
  @PrimaryGeneratedColumn({ name: 'reply_id' })
  replyId: number;

  @Column({ name: 'review_id' })
  reviewId: number;

  @ManyToOne(() => Review, (review) => review.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text', name: 'reply_text' })
  replyText: string;

  @Column({ type: 'enum', enum: ReviewReplyStatus, default: ReviewReplyStatus.ACTIVE })
  status: ReviewReplyStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
