import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Content } from './content.entity';
import { FAQCategory } from '../../../common/constants/content.constant';

@Entity('faqs')
export class FAQ extends BaseEntity {
    @Column({ name: 'content_id' })
    contentId: string;

    @Column({
        type: 'enum',
        enum: FAQCategory,
    })
    category: FAQCategory;

    @Column({ type: 'text' })
    question: string;

    @Column({ type: 'text' })
    answer: string;

    @Column({ name: 'helpful_count', default: 0 })
    helpfulCount: number;

    @Column({ name: 'not_helpful_count', default: 0 })
    notHelpfulCount: number;

    @Column({ name: 'related_faqs', type: 'simple-array', nullable: true })
    relatedFAQs: string[];

    @Column({ name: 'related_articles', type: 'simple-array', nullable: true })
    relatedArticles: string[];

    @Column({ name: 'search_keywords', type: 'simple-array', nullable: true })
    searchKeywords: string[];

    @OneToOne(() => Content)
    @JoinColumn({ name: 'content_id' })
    content: Content;
}
