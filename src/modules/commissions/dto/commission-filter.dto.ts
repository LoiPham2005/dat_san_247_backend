import { IsOptional, IsEnum, IsString, IsDateString, IsUUID } from 'class-validator';
import { CommissionStatus } from '../entities/commission-record.entity';

export class CommissionFilterDto {
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @IsOptional()
  @IsEnum(CommissionStatus)
  status?: CommissionStatus;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  searchQuery?: string;
}