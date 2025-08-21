import { User } from 'src/modules/auth/entities/user.entity';
import { RefreshToken } from 'src/modules/refresh-tokens/entities/refresh-token.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

export enum DeviceType {
    MOBILE = 'mobile',
    TABLET = 'tablet',
    DESKTOP = 'desktop',
    WEB = 'web',
}

@Entity('user_sessions')
export class UserSession {
    @PrimaryGeneratedColumn('uuid', { name: 'session_id' })
    sessionId: string;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'enum', enum: DeviceType, name: 'device_type' })
    deviceType: DeviceType;

    @Column({ type: 'json', nullable: true, name: 'device_info' })
    deviceInfo: Record<string, any>;

    @Column({ length: 45, nullable: true, name: 'ip_address' })
    ipAddress: string;

    @Column({ type: 'json', nullable: true, name: 'location_info' })
    locationInfo: Record<string, any>;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'login_at' })
    loginAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'last_activity' })
    lastActivity: Date;

    @Column({ type: 'timestamp', nullable: true, name: 'logout_at' })
    logoutAt: Date;

    @Column({ default: true, name: 'is_active' })
    isActive: boolean;

    @Column({ length: 500, nullable: true, name: 'fcm_token' })
    fcmToken: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;


    @OneToMany(() => RefreshToken, (token) => token.session)
    refreshTokens: RefreshToken[];
}
