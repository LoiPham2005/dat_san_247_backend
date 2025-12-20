import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { StaffProfile, Department } from './entities/staff-profile.entity';
import { User } from '../users/entities/user.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffFilterDto } from './dto/staff-filter.dto';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);

  constructor(
    @InjectRepository(StaffProfile)
    private readonly staffRepo: Repository<StaffProfile>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // =====================================================
  // CREATE - Tạo nhân viên mới
  // =====================================================
  async create(dto: CreateStaffDto): Promise<StaffProfile> {
    // Kiểm tra user tồn tại
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    // Kiểm tra employee code đã tồn tại
    const existingCode = await this.staffRepo.findOne({
      where: { employeeCode: dto.employeeCode },
    });
    if (existingCode) {
      throw new ConflictException(`Employee code ${dto.employeeCode} already exists`);
    }

    // Kiểm tra user chưa là nhân viên
    const existingStaff = await this.staffRepo.findOne({
      where: { userId: dto.userId },
    });
    if (existingStaff) {
      throw new ConflictException(`User ${dto.userId} is already a staff member`);
    }

    // Nếu có manager, kiểm tra manager tồn tại
    if (dto.managedBy) {
      const manager = await this.staffRepo.findOne({
        where: { id: dto.managedBy },
      });
      if (!manager) {
        throw new NotFoundException(`Manager with ID ${dto.managedBy} not found`);
      }
    }

    const staff = this.staffRepo.create(dto);
    return this.staffRepo.save(staff);
  }

  // =====================================================
  // READ - Lấy danh sách nhân viên
  // =====================================================
  async findAll(filters?: StaffFilterDto): Promise<StaffProfile[]> {
    const query = this.staffRepo.createQueryBuilder('staff')
      .leftJoinAndSelect('staff.user', 'user')
      .leftJoinAndSelect('staff.manager', 'manager');

    if (filters?.department) {
      query.where('staff.department = :department', { department: filters.department });
    }

    if (filters?.position) {
      query.andWhere('staff.position = :position', { position: filters.position });
    }

    if (filters?.searchTerm) {
      query.andWhere(
        '(user.id ILIKE :search OR staff.employeeCode ILIKE :search OR user.email ILIKE :search)',
        { search: `%${filters.searchTerm}%` }
      );
    }

    return query.orderBy('staff.createdAt', 'DESC').getMany();
  }

  // =====================================================
  // READ - Lấy nhân viên theo ID
  // =====================================================
  async findOne(id: string): Promise<StaffProfile> {
    const staff = await this.staffRepo.findOne({
      where: { id },
      relations: ['user', 'manager'],
    });

    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }

    return staff;
  }

  // =====================================================
  // READ - Lấy nhân viên theo user ID
  // =====================================================
  async findByUserId(userId: string): Promise<StaffProfile> {
    const staff = await this.staffRepo.findOne({
      where: { userId },
      relations: ['user', 'manager'],
    });

    if (!staff) {
      throw new NotFoundException(`Staff with user ID ${userId} not found`);
    }

    return staff;
  }

  // =====================================================
  // READ - Lấy nhân viên theo employee code
  // =====================================================
  async findByEmployeeCode(employeeCode: string): Promise<StaffProfile> {
    const staff = await this.staffRepo.findOne({
      where: { employeeCode },
      relations: ['user', 'manager'],
    });

    if (!staff) {
      throw new NotFoundException(`Staff with employee code ${employeeCode} not found`);
    }

    return staff;
  }

  // =====================================================
  // READ - Lấy nhân viên theo phòng ban
  // =====================================================
  async findByDepartment(department: Department): Promise<StaffProfile[]> {
    return this.staffRepo.find({
      where: { department },
      relations: ['user', 'manager'],
      order: { createdAt: 'DESC' },
    });
  }

  // =====================================================
  // READ - Lấy nhân viên dưới quản lý của một manager
  // =====================================================
  async findByManager(managerId: string): Promise<StaffProfile[]> {
    return this.staffRepo.find({
      where: { managedBy: managerId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // =====================================================
  // READ - Thống kê nhân viên theo phòng ban
  // =====================================================
  async getStaffStatistics(): Promise<Record<Department, number>> {
    const stats = await this.staffRepo
      .createQueryBuilder('staff')
      .select('staff.department', 'department')
      .addSelect('COUNT(*)', 'count')
      .groupBy('staff.department')
      .getRawMany();

    const result: any = {};
    stats.forEach((stat) => {
      result[stat.department] = parseInt(stat.count);
    });
    return result;
  }

  // =====================================================
  // UPDATE - Cập nhật nhân viên
  // =====================================================
  async update(id: string, dto: UpdateStaffDto): Promise<StaffProfile> {
    const staff = await this.findOne(id);

    // Nếu thay đổi employee code, kiểm tra code mới không tồn tại
    if (dto.employeeCode && dto.employeeCode !== staff.employeeCode) {
      const existingCode = await this.staffRepo.findOne({
        where: { employeeCode: dto.employeeCode },
      });
      if (existingCode) {
        throw new ConflictException(`Employee code ${dto.employeeCode} already exists`);
      }
    }

    // Nếu thay đổi manager, kiểm tra manager tồn tại
    if (dto.managedBy) {
      const manager = await this.staffRepo.findOne({
        where: { id: dto.managedBy },
      });
      if (!manager) {
        throw new NotFoundException(`Manager with ID ${dto.managedBy} not found`);
      }
    }

    Object.assign(staff, dto);
    return this.staffRepo.save(staff);
  }

  // =====================================================
  // UPDATE - Cập nhật phòng ban
  // =====================================================
  async updateDepartment(id: string, department: Department): Promise<StaffProfile> {
    const staff = await this.findOne(id);
    staff.department = department;
    return this.staffRepo.save(staff);
  }

  // =====================================================
  // UPDATE - Cập nhật lương
  // =====================================================
  async updateSalary(id: string, salary: number): Promise<StaffProfile> {
    if (salary < 0) {
      throw new BadRequestException('Salary must be greater than 0');
    }

    const staff = await this.findOne(id);
    staff.salary = salary;
    return this.staffRepo.save(staff);
  }

  // =====================================================
  // UPDATE - Cập nhật quyền
  // =====================================================
  async updatePermissions(
    id: string,
    permissions: Record<string, any>
  ): Promise<StaffProfile> {
    const staff = await this.findOne(id);
    staff.permissions = { ...staff.permissions, ...permissions };
    return this.staffRepo.save(staff);
  }

  // =====================================================
  // DELETE - Xóa nhân viên
  // =====================================================
  async remove(id: string): Promise<void> {
    const staff = await this.findOne(id);
    
    // Nếu có nhân viên dưới quản lý, xóa liên kết manager
    // FIX: Thay đổi null thành undefined hoặc dùng query builder
    await this.staffRepo
      .createQueryBuilder()
      .update(StaffProfile)
      .set({ managedBy: undefined })
      .where('managedBy = :managerId', { managerId: id })
      .execute();

    await this.staffRepo.remove(staff);
  }

  // =====================================================
  // Kiểm tra quyền
  // =====================================================
  async hasPermission(staffId: string, permission: string): Promise<boolean> {
    const staff = await this.findOne(staffId);
    return staff.permissions?.[permission] === true;
  }

  // =====================================================
  // Cấp quyền cho nhân viên
  // =====================================================
  async grantPermission(staffId: string, permission: string): Promise<StaffProfile> {
    const staff = await this.findOne(staffId);
    if (!staff.permissions) {
      staff.permissions = {};
    }
    staff.permissions[permission] = true;
    return this.staffRepo.save(staff);
  }

  // =====================================================
  // Thu hồi quyền từ nhân viên
  // =====================================================
  async revokePermission(staffId: string, permission: string): Promise<StaffProfile> {
    const staff = await this.findOne(staffId);
    if (staff.permissions) {
      staff.permissions[permission] = false;
    }
    return this.staffRepo.save(staff);
  }
}