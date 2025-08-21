import { IsNotEmpty, IsOptional, IsString, IsEnum, IsInt } from 'class-validator';
import { CategoryStatus } from '../entities/sport-category.entity';

export class CreateSportCategoryDto {
  @IsNotEmpty()
  @IsString()
  categoryName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
