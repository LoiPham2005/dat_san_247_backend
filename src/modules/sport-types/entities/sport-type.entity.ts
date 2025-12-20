// =====================================================
// 4. SPORT_TYPE ENTITY
// =====================================================
// modules/sport-types/entities/sport-type.entity.ts
import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Court } from '../../courts/entities/court.entity';

@Entity('sport_types')
@Index(['slug'])
export class SportType extends BaseEntity {
  @Column({ name: 'sport_name', length: 100, unique: true })
  sportName: string;

  @Column({ length: 150, unique: true })
  slug: string;

  @Column({ name: 'icon_url', length: 500, nullable: true })
  iconUrl?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @OneToMany(() => Court, (court) => court.sportType)
  courts: Court[];
}