import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { RoleType } from '../entities/role.entity';

export class CreateRoleDto {
  @IsEnum(RoleType)
  name: RoleType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
