import { Entity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/entities/base.entity';
import { Permission } from '../../permissions/entities/permission.entity';
import { User } from '../../users/entities/user.entity';

@Entity('roles')
export class Role extends BaseEntity {
    @Column({ unique: true, length: 100 })
    name: string; // e.g., 'Venue Manager', 'Cashier'

    @Column({ unique: true, length: 100 })
    slug: string; // e.g., 'venue_manager', 'cashier' (for code reference)

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'is_system', default: false })
    isSystem: boolean; // System roles (ADMIN, CUSTOMER) cannot be deleted

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @ManyToMany(() => Permission, (permission) => permission.roles, {
        cascade: true,
        eager: true, // Auto-load permissions when fetching role
    })
    @JoinTable({
        name: 'role_permissions',
        joinColumn: { name: 'role_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    })
    permissions: Permission[];

    @OneToMany(() => User, (user) => user.role)
    users: User[];
}
