import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { UserRole } from '../../../common/constants/role.constant';

export class UserFilterDto extends PaginationDto {
    @ApiPropertyOptional({ enum: UserRole })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: 'true' })
    @IsOptional()
    isActive?: string;

    @ApiPropertyOptional({ example: 'true', description: 'Search for deleted users if true' })
    @IsOptional()
    isDeleted?: string;
}
