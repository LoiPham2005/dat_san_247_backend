// src/modules/sports-field/dto/update-sports-field.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateSportsFieldDto } from './sports-fields.dto';

export class UpdateSportsFieldDto extends PartialType(CreateSportsFieldDto) {}
