import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PaymentStatus } from '../../../common/constants/payment-status.constant';
import { PaymentMethod } from '../../../common/constants/payment-method.constant';

export class PaymentFilterDto extends PaginationDto {
    @ApiPropertyOptional({ enum: PaymentStatus })
    @IsOptional()
    @IsEnum(PaymentStatus)
    status?: PaymentStatus;

    @ApiPropertyOptional({ enum: PaymentMethod })
    @IsOptional()
    @IsEnum(PaymentMethod)
    method?: PaymentMethod;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;
}
