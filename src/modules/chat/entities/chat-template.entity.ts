import { Entity, Column, ManyToOne, JoinColumn, Index, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { TemplateCategory } from '../../../common/constants/chat.constant';
import { UserRole } from '../../../common/constants/role.constant';
import { User } from '../../users/entities/user.entity';

@Entity('chat_templates')
export class ChatTemplate extends BaseEntity {
    @Column()
    title: string;

    @Column({
        type: 'enum',
        enum: TemplateCategory,
        default: TemplateCategory.OTHER
    })
    @Index()
    category: TemplateCategory;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'jsonb', nullable: true, comment: 'Dynamic variables user can fill' })
    variables: string[];

    @Column({ name: 'used_by', type: 'jsonb', nullable: true, comment: 'Roles allowed to use this template' })
    usedBy: UserRole[];

    @Column({ name: 'usage_count', default: 0 })
    usageCount: number;

    @Column({ name: 'is_public', default: true })
    isPublic: boolean;

    @Column({ name: 'created_by', type: 'uuid' })
    @Index()
    createdById: string;

    @Column({ name: 'quick_replies', type: 'jsonb', nullable: true })
    quickReplies: string[];

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'created_by' })
    createdBy: Relation<User>;
}
