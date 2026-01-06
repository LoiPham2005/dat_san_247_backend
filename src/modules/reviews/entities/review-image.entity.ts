import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Review } from './review.entity';

@Entity('review_images')
export class ReviewImage extends BaseEntity {
    @Column({ name: 'review_id' })
    reviewId: string;

    @Column({ name: 'image_url', type: 'text' })
    imageUrl: string;

    @ManyToOne(() => Review, (review) => review.images, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'review_id' })
    review: Review;
}
