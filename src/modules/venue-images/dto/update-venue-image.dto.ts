import { PartialType } from '@nestjs/mapped-types';
import { CreateVenueImageDto } from './create-venue-image.dto';

export class UpdateVenueImageDto extends PartialType(CreateVenueImageDto) {}
