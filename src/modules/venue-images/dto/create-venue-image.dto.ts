import { IsNotEmpty, IsOptional, IsString, IsEnum, IsInt } from 'class-validator';
import { ImageType } from '../entities/venue-image.entity';

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
  displayOrder?: number;
}
