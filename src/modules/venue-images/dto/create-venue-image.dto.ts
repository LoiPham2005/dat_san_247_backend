import { IsNotEmpty, IsOptional, IsString, IsEnum, IsInt } from 'class-validator';
import { ImageType } from '../entities/venue-image.entity';
import { Type } from 'class-transformer';

export class CreateVenueImageDto {
  @IsNotEmpty()
  venueId: number;

  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsEnum(ImageType)
  imageType?: ImageType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  displayOrder?: number;

  @IsOptional()
  @IsString()
  cloudinaryId?: string;
}
