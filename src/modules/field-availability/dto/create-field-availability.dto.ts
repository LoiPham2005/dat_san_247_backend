// src/modules/field-availability/dto/create-field-availability.dto.ts
import { IsNumber, IsBoolean, IsString } from 'class-validator';

export class CreateFieldAvailabilityDto {
  @IsNumber()
  field_id: number;

  @IsNumber()
  day_of_week: number;

  @IsString()
  start_time: string;

  @IsString()
  end_time: string;

  @IsBoolean()
  is_closed?: boolean;
}
