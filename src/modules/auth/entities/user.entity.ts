import { 
  Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, 
  CreateDateColumn, UpdateDateColumn 
} from 'typeorm';
import { UserSession } from 'src/modules/user-sessions/entities/user-session.entity';
import { RefreshToken } from 'src/modules/refresh-tokens/entities/refresh-token.entity';
import { UserWallet } from 'src/modules/user-wallet/entities/user-wallet.entity';
import { Venue } from 'src/modules/venues/entities/venue.entity';
import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { WalletTransaction } from 'src/modules/wallet-transactions/entities/wallet-transaction.entity';
import { Review } from 'src/modules/reviews/entities/review.entity';
import { SystemSetting } from 'src/modules/system-settings/entities/system-setting.entity';
import { AuditLog } from 'src/modules/audit-log/entities/audit-log.entity';
import { Report } from 'src/modules/report/entities/report.entity';
import { Role } from '../../roles/entities/role.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  // --- Thông tin cơ bản ---
  @Column({ name: 'full_name' })
  fullname: string;

  @Column({ unique: true, name: 'username' })
  username: string;

  @Column({ unique: true, name: 'email' })
  email: string;

  @Column({ name: 'password' }) // Lưu password đã hash
  password: string;

  @Column({ nullable: true, name: 'phone' })
  phone?: string;

  @Column({ type: 'enum', enum: Gender, nullable: true, name: 'gender' })
  gender?: Gender;

  @Column({ nullable: true, type: 'date', name: 'birth_date' })
  birthDate?: Date;

  @Column({ nullable: true, name: 'avatar' })
  avatar?: string;

  // --- Vai trò và quyền ---
  @Column({ name: 'role_id' })
  roleId: number;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  userRole: Role;

  // --- Chỉ áp dụng cho venue_owner ---
  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;

  // --- Địa chỉ và định vị ---
  @Column({ nullable: true, name: 'address' })
  address?: string;

  @Column({ type: 'float', nullable: true, name: 'latitude' })
  latitude?: number;

  @Column({ type: 'float', nullable: true, name: 'longitude' })
  longitude?: number;

  // --- Trạng thái tài khoản ---
  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'enum', enum: ['banned', 'suspended'], nullable: true, name: 'special_status' })
  specialStatus?: string;

  @Column({ default: false, name: 'email_verified' })
  emailVerified: boolean;

  @Column({ default: false, name: 'phone_verified' })
  phoneVerified: boolean;

  // --- OAuth ---
  @Column({ nullable: true, name: 'provider' })
  provider?: string;

  @Column({ nullable: true, name: 'provider_id' })
  providerId?: string;

  // --- Audit ---
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt?: Date;

  // --- Quan hệ với các bảng khác ---
  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => UserWallet, (wallet) => wallet.user)
  wallet: UserWallet[];

  @OneToMany(() => Venue, (venue) => venue.owner)
  venues: Venue[];

  @OneToMany(() => Booking, (booking) => booking.customer)
  bookings: Booking[];

  @OneToMany(() => WalletTransaction, (tx) => tx.user)
  walletTransactions: WalletTransaction[];

  @OneToMany(() => Review, (review) => review.customer)
  reviews: Review[];

  @OneToMany(() => SystemSetting, (setting) => setting.updatedBy)
  updatedSettings: SystemSetting[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.user)
  auditLogs: AuditLog[];

  @OneToMany(() => Report, (report) => report.reporter)
  reportedReports: Report[];

  @OneToMany(() => Report, (report) => report.reportedUser)
  receivedReports: Report[];
}
