
import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsDateString, IsUUID, IsInt, Min, Max } from 'class-validator';
import { PromotionDiscountType, PromotionStatus } from '@prisma/client';

export class CreatePromotionDto {
    @IsString()
    code: string;

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(PromotionDiscountType)
    discount_type: PromotionDiscountType;

    @IsNumber()
    @Min(0)
    discount_value: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    max_discount_amount?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    min_booking_amount?: number = 0;

    @IsInt()
    @Min(1)
    @IsOptional()
    usage_limit?: number;

    @IsInt()
    @Min(1)
    @IsOptional()
    max_usage_per_user?: number = 1;

    @IsBoolean()
    @IsOptional()
    is_public?: boolean = true;

    @IsDateString()
    valid_from: string;

    @IsDateString()
    valid_to: string;

    @IsEnum(PromotionStatus)
    @IsOptional()
    status?: PromotionStatus = PromotionStatus.ACTIVE;

    @IsUUID('4', { each: true })
    @IsOptional()
    venue_ids?: string[];
}
