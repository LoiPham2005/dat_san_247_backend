import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, IsArray } from 'class-validator';
import { DiscountType, DiscountStatus } from '../entities/discount-code.entity';

export class CreateDiscountCodeDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNotEmpty()
  @IsNumber()
  discountValue: number;

  @IsOptional()
  @IsNumber()
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  maxDiscountAmount?: number;

  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @IsOptional()
  @IsNumber()
  usagePerUser?: number;

  @IsNotEmpty()
  validFrom: Date;

  @IsNotEmpty()
  validUntil: Date;

  @IsOptional()
  @IsArray()
  applicableVenues?: number[];

  @IsOptional()
  @IsArray()
  applicableCategories?: number[];

  @IsOptional()
  @IsArray()
  applicableDays?: string[];

  @IsOptional()
  @IsArray()
  applicableTimes?: { start: string; end: string }[];

  @IsOptional()
  @IsEnum(DiscountStatus)
  status?: DiscountStatus;

  @IsOptional()
  @IsNumber()
  createdBy?: number;
}
