import { Entity, Column, ManyToOne, OneToMany, JoinColumn, Index, OneToOne, Relation } from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { ContentType, ContentStatus, TargetAudience } from '../../../common/constants/content.constant';
import { File } from '../../uploads/entities/file.entity';
import { Banner } from './banner.entity';
import { BlogPost } from './blog-post.entity';
import { FAQ } from './faq.entity';
import { Policy } from './policy.entity';
import { EmailTemplate } from './email-template.entity';
import { PromotionContent } from './promotion-content.entity';

@Entity('contents')
export class Content extends BaseEntity {
    @ApiHideProperty()
    @Column({
        type: 'varchar',
        length: 50,
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

    @Column({ name: 'thumbnail_file_id', type: 'uuid', nullable: true })
    thumbnailFileId: string;

    @ManyToOne(() => File)
    @JoinColumn({ name: 'thumbnail_file_id' })
    thumbnail: Relation<File>;

    @Column({ name: 'thumbnail_url', nullable: true })
    thumbnailUrl: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    tags: string[];

    @Column({ type: 'jsonb', nullable: true })
    categories: string[];

    @Column({
        name: 'target_audience',
        type: 'enum',
        enum: TargetAudience,
        default: TargetAudience.ALL,
    })
    targetAudience: TargetAudience;

    @Column({ name: 'target_user_ids', type: 'jsonb', nullable: true })
    targetUserIds: string[];

    @Column({ name: 'target_regions', type: 'jsonb', nullable: true })
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

    @Column({ name: 'seo_keywords', type: 'jsonb', nullable: true })
    seoKeywords: string[];

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
    author: Relation<User>;

    @ManyToOne(() => Content, { nullable: true })
    @JoinColumn({ name: 'parent_id' })
    parent: Relation<Content>;

    @OneToMany(() => Content, (content) => content.parent)
    children: Relation<Content>[];

    // Inverse relations for specialized content
    @ApiProperty({ type: () => Banner })
    @OneToOne(() => Banner, (banner) => banner.content)
    banner: Relation<Banner>;

    @ApiProperty({ type: () => BlogPost })
    @OneToOne(() => BlogPost, (post) => post.content)
    blogPost: Relation<BlogPost>;

    @ApiProperty({ type: () => FAQ })
    @OneToOne(() => FAQ, (faq) => faq.content)
    faq: Relation<FAQ>;

    @ApiProperty({ type: () => Policy })
    @OneToOne(() => Policy, (policy) => policy.content)
    policy: Relation<Policy>;

    @ApiProperty({ type: () => EmailTemplate })
    @OneToOne(() => EmailTemplate, (template) => template.content)
    emailTemplate: Relation<EmailTemplate>;

    @ApiProperty({ type: () => PromotionContent })
    @OneToOne(() => PromotionContent, (promo) => promo.content)
    promotion: Relation<PromotionContent>;
}
