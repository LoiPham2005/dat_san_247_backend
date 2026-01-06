import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PromotionStatus } from '../../../common/constants/promotion-status.constant';

export class PromotionFilterDto extends PaginationDto {
    @ApiPropertyOptional({ enum: PromotionStatus })
    @IsOptional()
    @IsEnum(PromotionStatus)
    status?: PromotionStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;
}
