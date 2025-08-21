import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserSession } from '../../user-sessions/entities/user-session.entity';
import { User } from 'src/modules/auth/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text')
  token: string;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true , name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => UserSession, (session) => session.refreshTokens, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'session_id' })
  session: UserSession;

  @Column({ default: false })
  isRevoked: boolean;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
