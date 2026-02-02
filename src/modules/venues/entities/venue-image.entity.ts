import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Venue } from './venue.entity';
import { File } from '../../uploads/entities/file.entity';

@Entity('venue_images')
export class VenueImage extends BaseEntity {
    @Column({ name: 'venue_id', type: 'uuid' })
    @Index()
    venueId: string;

    @ManyToOne(() => Venue, (venue) => venue.images, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Venue;

    @Column({ name: 'file_id', type: 'uuid' })
    @Index()
    fileId: string;

    @ManyToOne(() => File, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'file_id' })
    file: File;

    @Column({ name: 'display_order', default: 0 })
    displayOrder: number;

    @Column({ name: 'is_cover', default: false })
    isCover: boolean;

    @Column({ nullable: true })
    caption: string;
}
