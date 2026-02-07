import { Entity, Column, ManyToOne, JoinColumn, OneToOne, Relation } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Content } from './content.entity';
import { EmailTemplateType } from '../../../common/constants/content.constant';

@Entity('email_templates')
export class EmailTemplate extends BaseEntity {
    @Column({ name: 'content_id' })
    contentId: string;

    @Column({
        type: 'enum',
        enum: EmailTemplateType,
    })
    templateType: EmailTemplateType;

    @Column({ name: 'template_name' })
    templateName: string;

    @Column()
    subject: string;

    @Column({ nullable: true })
    preheader: string;

    @Column({ name: 'html_content', type: 'text' })
    htmlContent: string;

    @Column({ name: 'text_content', type: 'text', nullable: true })
    textContent: string;

    @Column({ type: 'jsonb', nullable: true })
    variables: any[];

    @Column({ name: 'sample_data', type: 'jsonb', nullable: true })
    sampleData: Record<string, any>;

    @Column({ name: 'layout_id', nullable: true })
    layoutId: string;

    @Column({ type: 'jsonb', nullable: true })
    theme: any;

    @Column({ name: 'from_name' })
    fromName: string;

    @Column({ name: 'from_email' })
    fromEmail: string;

    @Column({ name: 'reply_to', nullable: true })
    replyTo: string;

    @Column({ default: 1 })
    version: number;

    @Column({ name: 'is_default', default: false })
    isDefault: boolean;

    @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
    lastUsedAt: Date;

    @ApiProperty({ type: () => Content })
    @OneToOne(() => Content, (content) => content.emailTemplate)
    @JoinColumn({ name: 'content_id' })
    content: Relation<Content>;
}
