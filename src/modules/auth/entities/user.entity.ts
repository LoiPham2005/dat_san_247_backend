import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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


@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // Thông tin cơ bản
  @Column({ unique: true })
  fullname: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Lưu password đã hash

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'], nullable: true })
  gender: string;

  @Column({ nullable: true, name: 'birth_date' })
  birthDate: Date;

  @Column({ nullable: true })
  avatar: string;

  // Vai trò: admin / user / venue_owner
  @Column({ type: 'enum', enum: ['admin', 'user', 'venue_owner'], default: 'user' })
  role: string;

  // Chỉ áp dụng cho venue_owner: xác thực chủ sân
  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;

  // Địa chỉ (chủ sân) + định vị (nếu muốn map)
  @Column({ nullable: true })
  address: string;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  // Trạng thái tài khoản
  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'enum', enum: ['banned', 'suspended'], nullable: true, name: 'special_status' })
  specialStatus?: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ default: false })
  phoneVerified: boolean;

  // OAuth
  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true, name: 'provider_id' })
  providerId: string;

  // Audit log
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Xóa mềm
  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt: Date;


  // --- Thêm phần này để tạo quan hệ với UserSession ---
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
