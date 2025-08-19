// src/modules/sports-field/dto/create-sports-field.dto.ts
import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { CourtType } from '../../common/enums/CourtType.enums';

export class CreateSportsFieldDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CourtType)
  type: CourtType;

  @IsString()
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  price_per_hour: number;

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}
