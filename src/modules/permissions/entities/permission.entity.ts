import { Entity, Column, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
    @Column({ unique: true, length: 100 })
    slug: string; // e.g., 'users:create', 'bookings:read'

    @Column({ length: 100 })
    resource: string; // e.g., 'users', 'bookings', 'venues'

    @Column({ length: 50 })
    action: string; // e.g., 'create', 'read', 'update', 'delete', 'manage'

    @Column({ type: 'text', nullable: true })
    description: string; // e.g., 'Ability to create new users'

    @ManyToMany(() => Role, (role) => role.permissions)
    roles: Role[];
}
