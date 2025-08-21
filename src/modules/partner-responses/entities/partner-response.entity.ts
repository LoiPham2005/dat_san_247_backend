import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { PartnerRequest } from '../../partner-requests/entities/partner-request.entity';
import { User } from 'src/modules/auth/entities/user.entity';

export enum PartnerResponseStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('partner_responses')
@Unique('unique_request_responder', ['requestId', 'responderId'])
export class PartnerResponse {
  @PrimaryGeneratedColumn({ name: 'response_id' })
  responseId: number;

  @Column({ name: 'request_id' })
  requestId: number;

  @ManyToOne(() => PartnerRequest, (request) => request.responses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: PartnerRequest;

  @Column({ name: 'responder_id' })
  responderId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'responder_id' })
  responder: User;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ length: 255, nullable: true, name: 'contact_info' })
  contactInfo: string;

  @Column({ type: 'enum', enum: PartnerResponseStatus, default: PartnerResponseStatus.PENDING })
  status: PartnerResponseStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
