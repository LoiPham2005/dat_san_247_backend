import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Venue } from '../../venues/entities/venue.entity';

export enum ImageType {
  MAIN = 'main',
  GALLERY = 'gallery',
  THUMBNAIL = 'thumbnail',
}

@Entity('venue_images')
export class VenueImage {
  @PrimaryGeneratedColumn({ name: 'image_id' })
  imageId: number;

  @Column({ name: 'venue_id' })
  venueId: number;

  @ManyToOne(() => Venue, (venue) => venue.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column({ name: 'image_url', length: 500 })
  imageUrl: string;

  @Column({ type: 'enum', enum: ImageType, default: ImageType.GALLERY, name: 'image_type' })
  imageType: ImageType;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
