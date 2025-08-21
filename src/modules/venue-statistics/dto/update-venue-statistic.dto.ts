import { PartialType } from '@nestjs/mapped-types';
import { CreateVenueStatisticDto } from './create-venue-statistic.dto';

export class UpdateVenueStatisticDto extends PartialType(CreateVenueStatisticDto) {}
