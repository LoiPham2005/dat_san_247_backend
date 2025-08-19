// src/modules/field-availability/dto/update-field-availability.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateFieldAvailabilityDto } from './create-field-availability.dto';

export class UpdateFieldAvailabilityDto extends PartialType(CreateFieldAvailabilityDto) {}
