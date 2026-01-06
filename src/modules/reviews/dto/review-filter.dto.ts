import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ReviewFilterDto extends PaginationDto {
    @ApiPropertyOptional({ minimum: 1, maximum: 5 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    venueId?: string;

    @ApiPropertyOptional({ example: 'true' })
    @IsOptional()
    isVisible?: string;
}
