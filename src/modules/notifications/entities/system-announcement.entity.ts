import { Entity, Column, ManyToOne, JoinColumn, Index, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('system_announcements')
export class SystemAnnouncement extends BaseEntity {
    @Column()
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ name: 'image_url', type: 'text', nullable: true })
    imageUrl: string;

    @Column({ name: 'link_url', type: 'text', nullable: true })
    linkUrl: string;

    @Column({ name: 'type', default: 'INFO' }) // INFO, WARNING, SUCCESS, PROMOTION
    type: string;

    @Column({ name: 'target_roles', type: 'jsonb', nullable: true, comment: 'Roles that can see this: ["customer", "owner"]' })
    targetRoles: string[];

    @Column({ name: 'start_date', type: 'timestamp' })
    @Index()
    startDate: Date;

    @Column({ name: 'end_date', type: 'timestamp' })
    @Index()
    endDate: Date;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'created_by', type: 'uuid' })
    createdById: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    createdBy: Relation<User>;
}
