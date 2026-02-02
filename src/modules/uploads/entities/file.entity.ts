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

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
