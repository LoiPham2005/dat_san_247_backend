import { IsString, IsEnum, IsOptional, IsNumber, IsDate, IsJSON } from 'class-validator';
import { Department } from '../entities/staff-profile.entity';
import { Type } from 'class-transformer';

export class CreateStaffDto {
  @IsString()
  userId: string;

  @IsString()
  employeeCode: string;

  @IsEnum(Department)
  department: Department;

  @IsOptional()
  @IsString()
  position?: string;

  @IsDate()
  @Type(() => Date)
  hiredDate: Date;

  @IsOptional()
  @IsNumber()
  salary?: number;

  @IsOptional()
  @IsJSON()
  permissions?: Record<string, any>;

  @IsOptional()
  @IsString()
  managedBy?: string;
}