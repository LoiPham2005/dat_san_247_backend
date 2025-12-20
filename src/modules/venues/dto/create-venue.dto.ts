// modules/venues/dto/create-venue.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVenueDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  venueName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ward: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: '08:00' })
  @IsString()
  @IsNotEmpty()
  openingTime: string;

  @ApiProperty({ example: '22:00' })
  @IsString()
  @IsNotEmpty()
  closingTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  parkingAvailable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  wifiAvailable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showerAvailable?: boolean;
}