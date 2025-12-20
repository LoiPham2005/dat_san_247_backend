import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Banner } from './banner.entity';

@Entity('banner_analytics')
@Index(['bannerId', 'createdAt'])
@Index(['eventType'])
export class BannerAnalytics extends BaseEntity {
  @Column({ name: 'banner_id', type: 'uuid' })
  bannerId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ name: 'event_type' })
  eventType: 'view' | 'click';

  @Column({ name: 'ip_address', length: 50, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string;



  @ManyToOne(() => Banner, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'banner_id' })
  banner: Banner;
}