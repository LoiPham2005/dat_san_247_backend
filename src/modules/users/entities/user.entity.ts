import {
    Entity,
    Column,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { UserRole } from '../../../common/constants/role.constant';
import { Gender } from '../../../common/constants/gender.constant';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { FavoriteVenue } from '../../venues/entities/favorite-venue.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { ActivityLog } from '../../analytics/entities/activity-log.entity';
import { File } from '../../uploads/entities/file.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User extends BaseEntity {
    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column({ name: 'full_name' })
    fullName: string;

    @Column({ unique: true, nullable: true })
    phone: string;

    @ManyToOne(() => Role, (role) => role.users, { eager: true, nullable: true })
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @Column({ name: 'avatar_url', nullable: true })
    avatarUrl: string;

    @Column({ type: 'enum', enum: Gender, nullable: true })
    gender: Gender;

    @Column({ name: 'date_of_birth', type: 'date', nullable: true })
    dateOfBirth: Date;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'is_verified', default: false })
    isVerified: boolean;

    @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
    lastLoginAt: Date;

    @OneToMany(() => Booking, (booking) => booking.customer)
    bookings: Booking[];

    @OneToMany(() => Review, (review) => review.user)
    reviews: Review[];

    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];

    @OneToMany(() => FavoriteVenue, (fv) => fv.user)
    favoriteVenues: FavoriteVenue[];

    @OneToMany(() => RefreshToken, (rt) => rt.user)
    refreshTokens: RefreshToken[];

    @OneToMany(() => ActivityLog, (al) => al.user)
    activityLogs: ActivityLog[];

    @OneToMany(() => File, (f) => f.user)
    files: File[];
}
