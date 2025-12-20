import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffFilterDto } from './dto/staff-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Department } from './entities/staff-profile.entity';

@ApiTags('Staff Management')
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  // =====================================================
  // CREATE
  // =====================================================
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new staff member' })
  async create(@Body() dto: CreateStaffDto) {
    const staff = await this.staffService.create(dto);
    return {
      success: true,
      message: 'Staff member created successfully',
      data: staff,
    };
  }

  // =====================================================
  // READ - All
  // =====================================================
  @Get()
  @ApiOperation({ summary: 'Get all staff members with filters' })
  async findAll(@Query() filters: StaffFilterDto) {
    const staffs = await this.staffService.findAll(filters);
    return {
      success: true,
      message: 'Staff members retrieved successfully',
      data: staffs,
      total: staffs.length,
    };
  }

  // =====================================================
  // READ - By ID
  // =====================================================
  @Get(':id')
  @ApiOperation({ summary: 'Get staff member by ID' })
  async findOne(@Param('id') id: string) {
    const staff = await this.staffService.findOne(id);
    return {
      success: true,
      message: 'Staff member retrieved successfully',
      data: staff,
    };
  }

  // =====================================================
  // READ - By User ID
  // =====================================================
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get staff member by user ID' })
  async findByUserId(@Param('userId') userId: string) {
    const staff = await this.staffService.findByUserId(userId);
    return {
      success: true,
      message: 'Staff member retrieved successfully',
      data: staff,
    };
  }

  // =====================================================
  // READ - By Employee Code
  // =====================================================
  @Get('code/:employeeCode')
  @ApiOperation({ summary: 'Get staff member by employee code' })
  async findByEmployeeCode(@Param('employeeCode') employeeCode: string) {
    const staff = await this.staffService.findByEmployeeCode(employeeCode);
    return {
      success: true,
      message: 'Staff member retrieved successfully',
      data: staff,
    };
  }

  // =====================================================
  // READ - By Department
  // =====================================================
  @Get('department/:department')
  @ApiOperation({ summary: 'Get all staff members in a department' })
  async findByDepartment(@Param('department') department: Department) {
    const staffs = await this.staffService.findByDepartment(department);
    return {
      success: true,
      message: 'Staff members retrieved successfully',
      data: staffs,
      total: staffs.length,
    };
  }

  // =====================================================
  // READ - By Manager
  // =====================================================
  @Get('manager/:managerId/subordinates')
  @ApiOperation({ summary: 'Get staff members managed by a manager' })
  async findByManager(@Param('managerId') managerId: string) {
    const staffs = await this.staffService.findByManager(managerId);
    return {
      success: true,
      message: 'Subordinates retrieved successfully',
      data: staffs,
      total: staffs.length,
    };
  }

  // =====================================================
  // READ - Statistics
  // =====================================================
  @Get('statistics/by-department')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get staff statistics by department' })
  async getStatistics() {
    const stats = await this.staffService.getStaffStatistics();
    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  // =====================================================
  // UPDATE
  // =====================================================
  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update staff member' })
  async update(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    const staff = await this.staffService.update(id, dto);
    return {
      success: true,
      message: 'Staff member updated successfully',
      data: staff,
    };
  }

  // =====================================================
  // UPDATE - Department
  // =====================================================
  @Put(':id/department')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update staff member department' })
  async updateDepartment(
    @Param('id') id: string,
    @Body('department') department: Department
  ) {
    const staff = await this.staffService.updateDepartment(id, department);
    return {
      success: true,
      message: 'Department updated successfully',
      data: staff,
    };
  }

  // =====================================================
  // UPDATE - Salary
  // =====================================================
  @Put(':id/salary')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update staff member salary' })
  async updateSalary(
    @Param('id') id: string,
    @Body('salary') salary: number
  ) {
    const staff = await this.staffService.updateSalary(id, salary);
    return {
      success: true,
      message: 'Salary updated successfully',
      data: staff,
    };
  }

  // =====================================================
  // UPDATE - Permissions
  // =====================================================
  @Put(':id/permissions')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update staff member permissions' })
  async updatePermissions(
    @Param('id') id: string,
    @Body('permissions') permissions: Record<string, boolean>
  ) {
    const staff = await this.staffService.updatePermissions(id, permissions);
    return {
      success: true,
      message: 'Permissions updated successfully',
      data: staff,
    };
  }

  // =====================================================
  // DELETE
  // =====================================================
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete staff member' })
  async remove(@Param('id') id: string) {
    await this.staffService.remove(id);
    return {
      success: true,
      message: 'Staff member deleted successfully',
    };
  }

  // =====================================================
  // Permissions Management
  // =====================================================
  @Post(':id/permissions/:permission')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Grant permission to staff member' })
  async grantPermission(
    @Param('id') id: string,
    @Param('permission') permission: string
  ) {
    const staff = await this.staffService.grantPermission(id, permission);
    return {
      success: true,
      message: 'Permission granted successfully',
      data: staff,
    };
  }

  @Delete(':id/permissions/:permission')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Revoke permission from staff member' })
  async revokePermission(
    @Param('id') id: string,
    @Param('permission') permission: string
  ) {
    const staff = await this.staffService.revokePermission(id, permission);
    return {
      success: true,
      message: 'Permission revoked successfully',
      data: staff,
    };
  }
}