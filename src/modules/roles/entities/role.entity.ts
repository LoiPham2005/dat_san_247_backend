import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/modules/auth/entities/user.entity';
import { Permission } from '../../permissions/entities/permission.entity';

export enum RoleType {
  ADMIN = 'admin',              // Quản trị viên hệ thống
  SUB_ADMIN = 'sub_admin',      // Quản trị viên khu vực / phụ
  MODERATOR = 'moderator',      // Kiểm duyệt nội dung, duyệt sân
  SUPPORT = 'support',          // CSKH / hỗ trợ
  VENUE_OWNER = 'venue_owner',  // Chủ sân
  PARTNER = 'partner',          // Đối tác dịch vụ (ăn uống, vận chuyển…)
  CUSTOMER = 'customer'         // Khách hàng cuối
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

  @Column({ default: true, name: 'is_active' })
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