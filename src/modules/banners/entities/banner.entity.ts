import { Entity, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum TargetType {
  VENUE = 'venue',
  SPORT_TYPE = 'sport_type',
  PROMOTION = 'promotion',
  EXTERNAL = 'external',
}

export enum BannerPosition {
  HOME_TOP = 'home_top',
  HOME_MIDDLE = 'home_middle',
  SEARCH_TOP = 'search_top',
  VENUE_DETAIL = 'venue_detail',
}

@Entity('banners')
@Index(['position', 'isActive', 'displayOrder'])
@Index(['startDate', 'endDate'])
export class Banner extends BaseEntity {
  @Column({ length: 200 })
  title: string;

  @Column({ name: 'image_url', length: 500 })
  imageUrl: string;

  @Column({ name: 'link_url', length: 500, nullable: true })
  linkUrl?: string;

  @Column({ name: 'target_type', type: 'enum', enum: TargetType })
  targetType: TargetType;

  @Column({ name: 'target_id', length: 100, nullable: true })
  targetId?: string;

  @Column({ type: 'enum', enum: BannerPosition })
  position: BannerPosition;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate: Date;

  @Column({ name: 'click_count', default: 0 })
  clickCount: number;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;



  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator?: User;
}