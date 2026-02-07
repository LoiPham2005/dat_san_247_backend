import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    Relation,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Review } from './review.entity';
import { File } from '../../uploads/entities/file.entity';

@Entity('review_images')
export class ReviewImage extends BaseEntity {
    @Column({ name: 'review_id', type: 'uuid' })
    @Index()
    reviewId: string;

    @ManyToOne(() => Review, (review) => review.images, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'review_id' })
    review: Relation<Review>;

    @Column({ name: 'file_id', type: 'uuid' })
    @Index()
    fileId: string;

    @ManyToOne(() => File, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'file_id' })
    file: Relation<File>;

    @Column({ name: 'display_order', default: 0 })
    displayOrder: number;
}
