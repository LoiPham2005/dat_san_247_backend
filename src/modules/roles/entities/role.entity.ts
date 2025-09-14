import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/modules/auth/entities/user.entity';
import { Permission } from '../../permissions/entities/permission.entity';

export enum RoleType {
  CUSTOMER = 'customer',
  VENUE_OWNER = 'venue_owner',
  ADMIN = 'admin',
  SUPPORT = 'support',
  MODERATOR = 'moderator'
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('increment')
  roleId: number;

  @Column({
    type: 'enum',
    enum: RoleType,
    unique: true
  })
  name: RoleType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => User, user => user.userRole)
  users: User[];

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'roleId'
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'permissionId'
    }
  })
  permissions: Permission[];
}