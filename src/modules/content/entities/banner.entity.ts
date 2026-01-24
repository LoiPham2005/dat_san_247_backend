import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Content } from './content.entity';
import { BannerPosition, BannerType } from '../../../common/constants/content.constant';

@Entity('banners')
export class Banner extends BaseEntity {
    @Column({ name: 'content_id' })
    contentId: string;

    @Column({
        type: 'enum',
        enum: BannerPosition,
    })
    position: BannerPosition;

    @Column({
        type: 'enum',
        enum: BannerType,
    })
    type: BannerType;

    @Column({ name: 'image_url' })
    imageUrl: string;

    @Column({ name: 'mobile_image_url', nullable: true })
    mobileImageUrl: string;

    @Column({ name: 'action_type', default: 'NONE' })
    actionType: 'LINK' | 'VENUE' | 'PROMOTION' | 'NONE';

    @Column({ name: 'action_url', nullable: true })
    actionUrl: string;

    @Column({ name: 'action_venue_id', nullable: true })
    actionVenueId: string;

    @Column({ name: 'action_promotion_id', nullable: true })
    actionPromotionId: string;

    @Column({ name: 'display_order', default: 0 })
    displayOrder: number;

    @Column({ name: 'auto_slide', default: true })
    autoSlide: boolean;

    @Column({ name: 'slide_duration', nullable: true })
    slideDuration: number;

    @Column({ name: 'start_date' })
    startDate: Date;

    @Column({ name: 'end_date', nullable: true })
    endDate: Date;

    @Column({ name: 'display_on_pages', type: 'simple-array', nullable: true })
    displayOnPages: string[];

    @Column({ default: 0 })
    impressions: number;

    @Column({ default: 0 })
    clicks: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    ctr: number;

    @OneToOne(() => Content)
    @JoinColumn({ name: 'content_id' })
    content: Content;
}
