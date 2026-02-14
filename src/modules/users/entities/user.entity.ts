import {
    Entity,
    Column,
    OneToMany,
    ManyToOne,
    JoinColumn,
    Relation,
} from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { UserRole } from '../../../common/constants/role.constant';
import { Gender } from '../../../common/constants/gender.constant';
import { KYCStatus } from '../../../common/constants/kyc-status.constant';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { FavoriteVenue } from '../../venues/entities/favorite-venue.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { ActivityLog } from '../../analytics/entities/activity-log.entity';
import { File } from '../../uploads/entities/file.entity';
import { Role } from '../../roles/entities/role.entity';
import { ChatSettings } from '../../chat/entities/chat-settings.entity';
import { ConversationParticipant } from '../../chat/entities/participant.entity';
import { OneToOne } from 'typeorm';
import { MembershipTier } from './membership-tier.entity';

@Entity('users')
export class User extends BaseEntity {
    @Column({ unique: true })
    email: string;

    @Column({ unique: true, nullable: true })
    username: string;

    @Column({
        name: 'kyc_status',
        type: 'enum',
        enum: KYCStatus,
        default: KYCStatus.UNVERIFIED
    })
    kycStatus: KYCStatus;

    @Column({ select: false })
    password: string;

    @Column({ name: 'full_name' })
    fullName: string;

    @Column({ unique: true, nullable: true })
    phone: string;

    @ManyToOne(() => Role, (role) => role.users, { eager: true, nullable: true })
    @JoinColumn({ name: 'role_id' })
    role: Relation<Role>;

    @Column({ name: 'membership_tier_id', type: 'uuid', nullable: true })
    membershipTierId: string;

    @ManyToOne(() => MembershipTier, (tier) => tier.users, { nullable: true })
    @JoinColumn({ name: 'membership_tier_id' })
    membershipTier: Relation<MembershipTier>;

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

    @Column({ name: 'email_verified_at', type: 'timestamp', nullable: true })
    emailVerifiedAt: Date;

    @Column({ name: 'phone_verified_at', type: 'timestamp', nullable: true })
    phoneVerifiedAt: Date;

    @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
    lastLoginAt: Date;

    @OneToMany(() => Booking, (booking) => booking.customer)
    bookings: Relation<Booking>[];

    @OneToMany(() => Review, (review) => review.user)
    reviews: Relation<Review>[];

    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Relation<Notification>[];

    @OneToMany(() => FavoriteVenue, (fv) => fv.user)
    favoriteVenues: Relation<FavoriteVenue>[];

    @OneToMany(() => RefreshToken, (rt) => rt.user)
    refreshTokens: Relation<RefreshToken>[];

    @OneToMany(() => ActivityLog, (al) => al.user)
    activityLogs: Relation<ActivityLog>[];

    @OneToMany(() => File, (f) => f.user)
    files: Relation<File>[];

    @OneToOne(() => ChatSettings, (settings) => settings.user)
    chatSettings: Relation<ChatSettings>;

    @OneToMany(() => ConversationParticipant, (cp) => cp.user)
    chats: Relation<ConversationParticipant>[];
}
