import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { Sex } from 'src/modules/common/enums/sex.enums';
import { SportsField } from 'src/modules/sports-fields/entities/sports-fields.entities';
import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { Review } from 'src/modules/reviews/entities/review.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Complaint } from 'src/modules/complaints/entities/complaint.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // Thông tin cơ bản
  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Lưu password đã hash

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: Sex,
    nullable: true
  })
  sex: Sex;

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
  @Column({ default: true })
  status: boolean;

  // Quản lý refresh token
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

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

  @OneToMany(() => SportsField, sportsField => sportsField.owner)
  sportsFields: SportsField[];

  @OneToMany(() => Booking, booking => booking.customer)
  bookings: Booking[];

  @OneToMany(() => Review, review => review.customer)
  reviews: Review[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @OneToMany(() => Complaint, complaint => complaint.user)
  complaints: Complaint[];

}
