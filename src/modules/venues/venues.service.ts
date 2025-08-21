import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from './entities/venue.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
  ) {}

  create(createDto: CreateVenueDto) {
    const venue = this.venueRepo.create(createDto);
    return this.venueRepo.save(venue);
  }

  findAll() {
    return this.venueRepo.find({ relations: ['owner', 'category'] });
  }

  findOne(venueId: number) {
    return this.venueRepo.findOne({ where: { venueId }, relations: ['owner', 'category'] });
  }

  update(venueId: number, updateDto: UpdateVenueDto) {
    return this.venueRepo.update({ venueId }, updateDto);
  }

  remove(venueId: number) {
    return this.venueRepo.delete({ venueId });
  }
}
