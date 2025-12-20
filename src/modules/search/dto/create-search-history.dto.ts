import { IsString, IsOptional, IsUUID, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSearchHistoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty()
  @IsString()
  searchQuery: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sportTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  resultCount?: number;
}