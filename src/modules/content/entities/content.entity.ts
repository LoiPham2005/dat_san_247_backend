import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { ContentType, ContentStatus, TargetAudience } from '../../../common/constants/content.constant';

@Entity('contents')
export class Content extends BaseEntity {
    @Column({
        type: 'enum',
        enum: ContentType,
    })
    @Index()
    type: ContentType;

    @Column()
    title: string;

    @Column({ nullable: true })
    @Index()
    slug: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'text', nullable: true })
    excerpt: string;

    @Column({ name: 'thumbnail_url', nullable: true })
    thumbnailUrl: string;

    @Column({ name: 'image_urls', type: 'simple-array', nullable: true })
    imageUrls: string[];

    @Column({ name: 'video_url', nullable: true })
    videoUrl: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @Column({ type: 'simple-array', nullable: true })
    tags: string[];

    @Column({ type: 'simple-array', nullable: true })
    categories: string[];

    @Column({
        name: 'target_audience',
        type: 'enum',
        enum: TargetAudience,
        default: TargetAudience.ALL,
    })
    targetAudience: TargetAudience;

    @Column({ name: 'target_user_ids', type: 'simple-array', nullable: true })
    targetUserIds: string[];

    @Column({ name: 'target_regions', type: 'simple-array', nullable: true })
    targetRegions: string[];

    @Column({
        type: 'enum',
        enum: ContentStatus,
        default: ContentStatus.DRAFT,
    })
    @Index()
    status: ContentStatus;

    @Column({ name: 'published_at', type: 'timestamp', nullable: true })
    publishedAt: Date;

    @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
    scheduledAt: Date;

    @Column({ name: 'expired_at', type: 'timestamp', nullable: true })
    expiredAt: Date;

    @Column({ name: 'seo_title', nullable: true })
    seoTitle: string;

    @Column({ name: 'seo_description', type: 'text', nullable: true })
    seoDescription: string;

    @Column({ name: 'seo_keywords', type: 'simple-array', nullable: true })
    seoKeywords: string[];

    @Column({ name: 'og_image', nullable: true })
    ogImage: string;

    @Column({ default: 0 })
    views: number;

    @Column({ default: 0 })
    clicks: number;

    @Column({ default: 0 })
    shares: number;

    @Column({ name: 'author_id', nullable: true })
    authorId: string;

    @Column({ name: 'author_type', default: 'ADMIN' })
    authorType: 'ADMIN' | 'SYSTEM';

    @Column({ default: 1 })
    version: number;

    @Column({ name: 'previous_version_id', nullable: true })
    previousVersionId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'author_id' })
    author: User;
}
