import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';

@Entity('settings')
export class Setting extends BaseEntity {
    @Column({ unique: true })
    key: string;

    @Column({ type: 'jsonb' })
    value: any;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ default: true })
    isActive: boolean;
}
