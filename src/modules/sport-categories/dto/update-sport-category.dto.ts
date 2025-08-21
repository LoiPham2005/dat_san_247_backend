import { PartialType } from '@nestjs/mapped-types';
import { CreateSportCategoryDto } from './create-sport-category.dto';

export class UpdateSportCategoryDto extends PartialType(CreateSportCategoryDto) {}
