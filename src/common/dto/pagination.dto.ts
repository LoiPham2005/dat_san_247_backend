// =====================================================
// 7. PAGINATION DTO
// =====================================================

// common/dto/pagination.dto.ts
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}