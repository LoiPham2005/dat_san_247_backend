import { PartialType } from '@nestjs/mapped-types';
import { CreateDiscountUsageDto } from './create-discount-usage.dto';

export class UpdateDiscountUsageDto extends PartialType(CreateDiscountUsageDto) {}
