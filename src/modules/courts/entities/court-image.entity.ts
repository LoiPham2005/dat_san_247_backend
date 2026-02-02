import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Court } from './court.entity';
import { File } from '../../uploads/entities/file.entity';

@Entity('court_images')
export class CourtImage extends BaseEntity {
    @Column({ name: 'court_id', type: 'uuid' })
    @Index()
    courtId: string;

    @ManyToOne(() => Court, (court) => court.images, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'court_id' })
    court: Court;

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
