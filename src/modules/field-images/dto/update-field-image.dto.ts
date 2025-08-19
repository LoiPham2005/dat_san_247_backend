// src/modules/field-images/dto/update-field-image.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateFieldImageDto } from './create-field-image.dto';

export class UpdateFieldImageDto extends PartialType(CreateFieldImageDto) {}
