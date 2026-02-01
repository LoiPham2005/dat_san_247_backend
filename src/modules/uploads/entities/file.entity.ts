import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { FileCategory } from '../../../common/constants/file-category.constant';

@Entity('files')
export class File extends BaseEntity {
    @Column({ name: 'user_id', nullable: true })
    @Index()
    userId: string;

    @Column({ name: 'target_type', nullable: true, comment: 'Polymorphic: VENUE, COURT, REVIEW, POST, CONTENT, etc.' })
    @Index()
    targetType: string;

    @Column({ name: 'target_id', type: 'uuid', nullable: true, comment: 'ID of the target entity' })
    @Index()
    targetId: string;

    @Column({
        type: 'enum',
        enum: FileCategory,
    })
    @Index()
    category: FileCategory;

    @Column({ name: 'original_name' })
    originalName: string;

    @Column({ name: 'file_name' })
    fileName: string;

    @Column({ name: 'file_size', type: 'bigint' })
    fileSize: number;

    @Column({ name: 'mime_type' })
    mimeType: string;

    @Column({ name: 'r2_key', type: 'text' })
    @Index()
    r2Key: string;

    @Column({ name: 'r2_bucket' })
    r2Bucket: string;

    @Column({ name: 'public_url', type: 'text' })
    publicUrl: string;

    @Column({ nullable: true })
    width: number;

    @Column({ nullable: true })
    height: number;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any;

    @Column({ name: 'display_order', default: 0 })
    displayOrder: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
