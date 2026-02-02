import { Entity, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Content } from './content.entity';
import { BlogCategory } from '../../../common/constants/content.constant';

@Entity('blog_posts')
export class BlogPost extends BaseEntity {
    @Column({ name: 'content_id' })
    contentId: string;

    @Column({
        type: 'enum',
        enum: BlogCategory,
    })
    category: BlogCategory;

    @Column()
    author: string;

    @Column({ name: 'author_avatar', nullable: true })
    authorAvatar: string;

    @Column({ name: 'reading_time', default: 0 })
    readingTime: number;

    @Column({ name: 'table_of_contents', type: 'jsonb', nullable: true })
    tableOfContents: any[];

    @Column({ name: 'canonical_url', nullable: true })
    canonicalUrl: string;

    @Column({ name: 'related_posts', type: 'simple-array', nullable: true })
    relatedPosts: string[];

    @Column({ default: 0 })
    likes: number;

    @Column({ default: 0 })
    comments: number;

    @Column({ default: 0 })
    bookmarks: number;

    @Column({ name: 'last_edited_at', nullable: true })
    lastEditedAt: Date;

    @OneToOne(() => Content)
    @JoinColumn({ name: 'content_id' })
    content: Content;
}
