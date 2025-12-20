// modules/vouchers/dto/create-voucher.dto.ts
import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsArray, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType, ApplicableTo } from '../entities/voucher.entity';

export class CreateVoucherDto {
  @ApiProperty()
  @IsString()
  voucherCode: string;

  @ApiProperty()
  @IsString()
  voucherName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DiscountType })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxDiscountAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minOrderAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  usagePerUser?: number;

  @ApiProperty({ enum: ApplicableTo })
  @IsEnum(ApplicableTo)
  applicableTo: ApplicableTo;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  venueIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  sportTypeIds?: string[];

  @ApiProperty()
  @IsDateString()
  validFrom: string;

  @ApiProperty()
  @IsDateString()
  validTo: string;
}