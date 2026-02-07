import { Entity, Column, ManyToOne, JoinColumn, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Venue } from '../../venues/entities/venue.entity';
import { AISearchQuery } from './ai-search-query.entity';

@Entity('ai_search_rankings')
export class AISearchRanking extends BaseEntity {
    @Column({ name: 'query_id' })
    queryId: string;

    @Column({ name: 'venue_id' })
    venueId: string;

    @Column({ name: 'relevance_score', type: 'decimal', precision: 5, scale: 4, nullable: true })
    relevanceScore: number;

    @Column({ name: 'popularity_score', type: 'decimal', precision: 5, scale: 4, nullable: true })
    popularityScore: number;

    @Column({ name: 'personalization_score', type: 'decimal', precision: 5, scale: 4, nullable: true })
    personalizationScore: number;

    @Column({ name: 'final_score', type: 'decimal', precision: 5, scale: 4, nullable: true })
    finalScore: number;

    @Column({ name: 'rank_position', type: 'int', nullable: true })
    rankPosition: number;

    @Column({ name: 'was_clicked', default: false })
    wasClicked: boolean;

    @Column({ name: 'click_position', type: 'int', nullable: true })
    clickPosition: number;

    @ManyToOne(() => AISearchQuery, (query) => query.rankings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'query_id' })
    query: Relation<AISearchQuery>;

    @ManyToOne(() => Venue, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'venue_id' })
    venue: Relation<Venue>;
}
