// src/modules/field-images/dto/create-field-image.dto.ts
import { IsString, IsEnum, IsNumber } from 'class-validator';
import { MediaType as FieldMediaType } from '../entities/field-image.entity';

export class CreateFieldImageDto {
  @IsNumber()
  field_id: number;

  @IsString()
  url: string;

  @IsEnum(FieldMediaType)
  type: FieldMediaType;
}
