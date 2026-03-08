import { IsOptional, IsInt, IsIn, IsString, Min, Max } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10

  @ApiPropertyOptional({ example: 'created_at' })
  @IsOptional()
  @IsString()
  sortBy?: string        // ví dụ: 'created_at' | 'price' | 'rating'

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc'

  // Helper — dùng trong service: skip = dto.offset
  get offset(): number {
    return (this.page - 1) * this.limit
  }
}

// ────────────────────────────────────────────────

export type PaginatedMeta = {
  total: number
  page: number
  limit: number
  lastPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export type PaginatedResult<T> = {
  data: T[]
  meta: PaginatedMeta
}

// Helper dùng trong service — gọi 1 dòng, không tính lại mỗi nơi
export const paginate = <T>(
  data: T[],
  total: number,
  dto: PaginationDto,
): PaginatedResult<T> => {
  const lastPage = Math.ceil(total / dto.limit) || 1
  return {
    data,
    meta: {
      total,
      page: dto.page,
      limit: dto.limit,
      lastPage,
      hasNextPage: dto.page < lastPage,
      hasPrevPage: dto.page > 1,
    },
  }
}