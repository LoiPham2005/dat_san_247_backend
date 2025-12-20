import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Department } from '../entities/staff-profile.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StaffFilterDto {
  @ApiPropertyOptional({ enum: Department })
  @IsOptional()
  @IsEnum(Department)
  department?: Department;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  searchTerm?: string;
}