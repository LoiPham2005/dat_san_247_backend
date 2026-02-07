import { Entity, Column, ManyToOne, JoinColumn, Index, Relation } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { File } from '../../uploads/entities/file.entity';

@Entity('social_media')
export class SocialMedia extends BaseEntity {
    @Column({ name: 'owner_type' }) // 'post', 'match_result'
    @Index()
    ownerType: string;

    @Column({ name: 'owner_id', type: 'uuid' })
    @Index()
    ownerId: string;

    @Column({ name: 'file_id', type: 'uuid' })
    fileId: string;

    @ManyToOne(() => File)
    @JoinColumn({ name: 'file_id' })
    file: Relation<File>;
}
