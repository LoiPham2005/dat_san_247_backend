import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VenueOperatingHour } from './entities/venue-operating-hour.entity';
import { CreateVenueOperatingHourDto } from './dto/create-venue-operating-hour.dto';
import { UpdateVenueOperatingHourDto } from './dto/update-venue-operating-hour.dto';

@Injectable()
export class VenueOperatingHoursService {
  constructor(
    @InjectRepository(VenueOperatingHour)
    private readonly operatingHourRepo: Repository<VenueOperatingHour>,
  ) {}

  create(createDto: CreateVenueOperatingHourDto) {
    const hour = this.operatingHourRepo.create(createDto);
    return this.operatingHourRepo.save(hour);
  }

  findAll() {
    return this.operatingHourRepo.find({ relations: ['venue'] });
  }

  findOne(scheduleId: number) {
    return this.operatingHourRepo.findOne({ where: { scheduleId }, relations: ['venue'] });
  }

  findByVenue(venueId: number) {
    return this.operatingHourRepo.find({ where: { venueId }, order: { dayOfWeek: 'ASC' } });
  }

  update(scheduleId: number, updateDto: UpdateVenueOperatingHourDto) {
    return this.operatingHourRepo.update({ scheduleId }, updateDto);
  }

  remove(scheduleId: number) {
    return this.operatingHourRepo.delete({ scheduleId });
  }
}
