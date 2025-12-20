// =====================================================
// 3. VENUE_IMAGE ENTITY
// =====================================================
// modules/venues/entities/venue-image.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Venue } from './venue.entity';

export enum ImageType {
  COVER = 'cover',
  GALLERY = 'gallery',
  FACILITY = 'facility',
  MENU = 'menu',
}

@Entity('venue_images')
@Index(['venueId', 'imageType'])
export class VenueImage extends BaseEntity {
  @Column({ name: 'venue_id', type: 'uuid' })
  venueId: string;

  @Column({ name: 'image_url', length: 500 })
  imageUrl: string;

  @Column({ name: 'image_type', type: 'enum', enum: ImageType })
  imageType: ImageType;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @ManyToOne(() => Venue, (venue) => venue.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;
}
