import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, IsArray } from 'class-validator';
import { VenueStatus } from '../entities/venue.entity';

export class CreateVenueDto {
  @IsNotEmpty()
  ownerId: number;

  @IsNotEmpty()
  @IsString()
  venueName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsNotEmpty()
  categoryId: number;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsEnum(VenueStatus)
  status?: VenueStatus;

  @IsOptional()
  @IsArray()
  amenities?: Record<string, any>[];

  @IsOptional()
  @IsArray()
  venueRules?: Record<string, any>[];
}
