// // =====================================================
// // 21. SEARCH_HISTORY ENTITY
// // =====================================================
// // modules/search/entities/search-history.entity.ts
// import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
// import { BaseEntity } from '../../../database/entities/base.entity';
// import { User } from '../../users/entities/user.entity';
// import { SportType } from '../../sport-types/entities/sport-type.entity';

// @Entity('search_history')
// @Index(['userId'])
// export class SearchHistory extends BaseEntity {
//   @Column({ name: 'user_id', type: 'uuid', nullable: true })
//   userId?: string;

//   @Column({ name: 'search_query', length: 300 })
//   searchQuery: string;

//   @Column({ name: 'sport_type_id', type: 'uuid', nullable: true })
//   sportTypeId?: string;

//   @Column({ length: 100, nullable: true })
//   city?: string;

//   @Column({ length: 100, nullable: true })
//   district?: string;

//   @Column({ name: 'search_date', type: 'date', nullable: true })
//   searchDate?: Date;

//   @Column({ name: 'result_count', default: 0 })
//   resultCount: number;

//   @ManyToOne(() => User, { nullable: true })
//   @JoinColumn({ name: 'user_id' })
//   user?: User;

//   @ManyToOne(() => SportType, { nullable: true })
//   @JoinColumn({ name: 'sport_type_id' })
//   sportType?: SportType;
// }









import { Entity, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { SportType } from '../../sport-types/entities/sport-type.entity';

@Entity('search_history')
@Index(['userId', 'createdAt'])
@Index(['searchQuery'])
@Index(['city', 'district'])
@Index(['sportTypeId'])
export class SearchHistory extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ name: 'search_query', length: 300 })
  searchQuery: string;

  @Column({ name: 'sport_type_id', type: 'uuid', nullable: true })
  sportTypeId?: string;

  @Column({ length: 100, nullable: true })
  city?: string;

  @Column({ length: 100, nullable: true })
  district?: string;

  @Column({ name: 'result_count', default: 0 })
  resultCount: number;

  @Column({ name: 'search_date', type: 'date', nullable: true })
  searchDate?: Date;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ name: 'radius', type: 'int', nullable: true })
  radius?: number;

  @Column({ name: 'search_type', length: 50, default: 'venue' })
  searchType: string;



  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => SportType, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sport_type_id' })
  sportType?: SportType;
}