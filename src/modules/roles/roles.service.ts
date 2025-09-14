import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleType } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // Tạo role mới
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name } = createRoleDto;

    // Kiểm tra role đã tồn tại chưa
    const existingRole = await this.roleRepository.findOne({ 
      where: { name: name as RoleType } 
    });
    if (existingRole) {
      throw new ConflictException(`Role "${name}" đã tồn tại`);
    }

    const role = this.roleRepository.create({
      ...createRoleDto,
      name: name as RoleType
    });
    
    return await this.roleRepository.save(role);
  }

  // Lấy tất cả roles
  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find({ order: { createdAt: 'DESC' } });
  }

  // Lấy role theo ID
  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { roleId: id } });
    if (!role) {
      throw new NotFoundException(`Role với ID ${id} không tồn tại`);
    }
    return role;
  }

  // Cập nhật role theo ID
  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    const updatedRole = Object.assign(role, updateRoleDto);
    return await this.roleRepository.save(updatedRole);
  }

  // Xóa role theo ID
  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }
}
