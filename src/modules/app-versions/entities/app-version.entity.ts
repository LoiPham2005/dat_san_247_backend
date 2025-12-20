// // =====================================================
// // 22. APP_VERSION ENTITY
// // =====================================================
// // modules/app-versions/entities/app-version.entity.ts
// import { Entity, Column, Index } from 'typeorm';
// import { BaseEntity } from '../../../database/entities/base.entity';

// export enum Platform {
//   IOS = 'ios',
//   ANDROID = 'android',
//   WEB = 'web',
// }

// @Entity('app_versions')
// @Index(['platform', 'versionNumber'])
// export class AppVersion extends BaseEntity {
//   @Column({ type: 'enum', enum: Platform })
//   platform: Platform;

//   @Column({ name: 'version_number', length: 20 })
//   versionNumber: string;

//   @Column({ name: 'build_number' })
//   buildNumber: number;

//   @Column({ name: 'min_supported_version', length: 20, nullable: true })
//   minSupportedVersion?: string;

//   @Column({ name: 'is_force_update', default: false })
//   isForceUpdate: boolean;

//   @Column({ name: 'release_notes', type: 'text', nullable: true })
//   releaseNotes?: string;

//   @Column({ name: 'download_url', length: 500, nullable: true })
//   downloadUrl?: string;

//   @Column({ name: 'is_active', default: true })
//   isActive: boolean;

//   @Column({ name: 'released_at', type: 'timestamp', nullable: true })
//   releasedAt?: Date;
// }










import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

export enum Platform {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web',
}

@Entity('app_versions')
@Index(['platform', 'versionNumber'])
@Index(['platform', 'isActive'])
export class AppVersion extends BaseEntity {
  @Column({ type: 'enum', enum: Platform })
  platform: Platform;

  @Column({ name: 'version_number', length: 20 })
  versionNumber: string;

  @Column({ name: 'build_number' })
  buildNumber: number;

  @Column({ name: 'min_supported_version', length: 20, nullable: true })
  minSupportedVersion?: string;

  @Column({ name: 'is_force_update', default: false })
  isForceUpdate: boolean;

  @Column({ name: 'release_notes', type: 'text', nullable: true })
  releaseNotes?: string;

  @Column({ name: 'download_url', length: 500, nullable: true })
  downloadUrl?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'released_at', type: 'timestamp', nullable: true })
  releasedAt?: Date;

  @Column({ name: 'download_count', default: 0 })
  downloadCount: number;

  @Column({ name: 'user_count', default: 0 })
  userCount: number;

  @Column({ name: 'crash_count', default: 0 })
  crashCount: number;

  @Column({ name: 'rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating?: number;

  @Column({ name: 'total_ratings', default: 0 })
  totalRatings: number;
}