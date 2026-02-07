import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    Relation,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { FileCategory } from '../../../common/constants/file-category.constant';
import { Content } from '../../content/entities/content.entity';
import { Banner } from '../../content/entities/banner.entity';
import { OneToMany } from 'typeorm';

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

    @Column({ name: 'r2_key', type: 'text', nullable: true })
    @Index()
    r2Key: string;

    @Column({ name: 'r2_bucket', nullable: true })
    r2Bucket: string;

    @Column({ name: 'public_url', type: 'text' })
    publicUrl: string;

    @Column({ nullable: true })
    width: number;

    @Column({ nullable: true })
    height: number;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any;

    @Column({ name: 'target_type', length: 50, nullable: true })
    @Index()
    targetType: string;

    @Column({ name: 'target_id', type: 'uuid', nullable: true })
    @Index()
    targetId: string;

    @Column({ name: 'display_order', default: 0 })
    displayOrder: number;

    // @Column({ type: 'jsonb', nullable: true, comment: 'AI image analysis: moderation, object detection, quality check' })
    // aiAnalysis: {
    //     moderationStatus?: string; // 'PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'
    //     hasViolations?: boolean;
    //     violationTypes?: Array<{ type: string; confidence: number }>;
    //     detectedObjects?: Array<{ label: string; confidence: number }>;
    //     imageQualityScore?: number;
    //     isBlurry?: boolean;
    //     isLowResolution?: boolean;
    //     isStadiumImage?: boolean;
    //     detectedSportType?: string;
    //     aiModel?: string;
    //     analyzedAt?: Date;
    //     reviewedBy?: string;
    //     reviewedAt?: Date;
    // };

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: Relation<User>;

    @OneToMany(() => Content, (c) => c.thumbnail)
    contentsWithThumbnail: Relation<Content>[];

    @OneToMany(() => Banner, (b) => b.mobileImage)
    bannersWithMobileImage: Relation<Banner>[];
}
