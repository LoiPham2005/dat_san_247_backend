import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

@Entity('media')
export class Media extends BaseEntity {
    @Column({ name: 'target_type' })
    @Index()
    targetType: string; // e.g., 'VENUE', 'COURT', 'REVIEW', 'POST'

    @Column({ name: 'target_id', type: 'uuid' })
    @Index()
    targetId: string;

    @Column({ name: 'url', type: 'text' })
    url: string;

    @Column({ name: 'file_type', nullable: true, comment: 'image, video, document' })
    fileType: string;

    @Column({ name: 'file_name', nullable: true })
    fileName: string;

    @Column({ name: 'size_bytes', type: 'bigint', nullable: true })
    sizeBytes: number;

    @Column({ name: 'display_order', default: 0 })
    displayOrder: number;

    @Column({ type: 'jsonb', nullable: true, comment: 'Metadata like dimensions, duration, etc.' })
    metadata: any;
}
