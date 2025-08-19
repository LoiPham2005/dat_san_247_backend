// src/users/entities/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { Sex } from 'src/modules/roles/sex.enums';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  avatar: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Lưu ý: Password đã hash

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

  @Column({ default: 'USER' })
  role: string;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @Column({ nullable: true })
  provider: string;

  @Column({ nullable: true })
  providerId: string;
}