import { IsString, IsOptional, IsEnum, IsNumber, IsDecimal, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommissionStatus } from '../entities/commission-record.entity';

export class CreateCommissionDto {
  @ApiProperty()
  @IsUUID()
  bookingId: string;

  @ApiProperty()
  @IsUUID()
  ownerId: string;

  @ApiProperty()
  @IsNumber()
  bookingAmount: number;

  @ApiProperty()
  @IsNumber()
  commissionRate: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}