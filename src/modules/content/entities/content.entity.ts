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

    @Column({ name: 'display_order', default: 0 })
    displayOrder: number;

    @Column({ name: 'author_id', type: 'uuid', nullable: true })
    authorId: string;

    @Column({ name: 'author_type', default: 'ADMIN' })
    authorType: string;

    @Column({ name: 'parent_id', type: 'uuid', nullable: true, comment: 'For nested content like FAQ categories' })
    parentId: string;

    @Column({ name: 'is_featured', default: false })
    isFeatured: boolean;

    @Column({ name: 'is_pinned', default: false })
    isPinned: boolean;

    @Column({ name: 'valid_from', type: 'timestamp', nullable: true })
    validFrom: Date;

    @Column({ name: 'valid_to', type: 'timestamp', nullable: true })
    validTo: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'author_id' })
    author: User;

    @ManyToOne(() => Content, { nullable: true })
    @JoinColumn({ name: 'parent_id' })
    parent: Content;

    @OneToMany(() => Content, (content) => content.parent)
    children: Content[];
}
