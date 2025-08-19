// src/modules/field-images/field-image.entity.ts
import { SportsField } from 'src/modules/sports-fields/entities/sports-fields.entities';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

@Entity('field_images')
export class FieldImage {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => SportsField, field => field.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'field_id' })
  field: SportsField;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'enum', enum: MediaType })
  type: MediaType;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
