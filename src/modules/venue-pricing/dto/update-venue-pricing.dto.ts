import { PartialType } from '@nestjs/mapped-types';
import { CreateVenuePricingDto } from './create-venue-pricing.dto';

export class UpdateVenuePricingDto extends PartialType(CreateVenuePricingDto) {}
