// modules/courts/dto/create-court.dto.ts
import { IsUUID, IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CourtStatus } from '../entities/court.entity';

export class CreateCourtDto {
  @ApiProperty()
  @IsUUID()
  venueId: string;

  @ApiProperty()
  @IsUUID()
  sportTypeId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courtName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courtSize?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  surfaceType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isIndoor?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasLighting?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasAirConditioning?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCourtDto extends PartialType(CreateCourtDto) {
  @ApiPropertyOptional({ enum: CourtStatus })
  @IsOptional()
  @IsEnum(CourtStatus)
  status?: CourtStatus;
}