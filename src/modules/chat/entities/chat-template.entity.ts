import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
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
    })
    category: TemplateCategory;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'simple-array', nullable: true })
    variables: string[];

    @Column({ name: 'used_by', type: 'simple-array' })
    usedBy: UserRole[];

    @Column({ name: 'usage_count', default: 0 })
    usageCount: number;

    @Column({ name: 'is_public', default: true })
    isPublic: boolean;

    @Column({ name: 'created_by' })
    createdBy: string;

    @Column({ name: 'quick_replies', type: 'simple-array', nullable: true })
    quickReplies: string[];

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    creator: User;
}
