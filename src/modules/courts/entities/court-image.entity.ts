import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Court } from './court.entity';

@Entity('court_images')
export class CourtImage extends BaseEntity {
    @Column({ name: 'court_id' })
    courtId: string;

    @Column({ name: 'image_url', type: 'text' })
    imageUrl: string;

    @Column({ name: 'alt_text', nullable: true })
    altText: string;

    @Column({ name: 'display_order', default: 0 })
    displayOrder: number;

    @ManyToOne(() => Court, (court) => court.images, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'court_id' })
    court: Court;
}
