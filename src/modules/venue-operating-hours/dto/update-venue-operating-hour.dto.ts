import { PartialType } from '@nestjs/mapped-types';
import { CreateVenueOperatingHourDto } from './create-venue-operating-hour.dto';

export class UpdateVenueOperatingHourDto extends PartialType(CreateVenueOperatingHourDto) {}
