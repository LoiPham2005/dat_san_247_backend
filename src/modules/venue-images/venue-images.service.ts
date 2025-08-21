import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VenueImage } from './entities/venue-image.entity';
import { CreateVenueImageDto } from './dto/create-venue-image.dto';
import { UpdateVenueImageDto } from './dto/update-venue-image.dto';

@Injectable()
export class VenueImagesService {
  constructor(
    @InjectRepository(VenueImage)
    private readonly venueImageRepo: Repository<VenueImage>,
  ) {}

  create(createDto: CreateVenueImageDto) {
    const image = this.venueImageRepo.create(createDto);
    return this.venueImageRepo.save(image);
  }

  findAll() {
    return this.venueImageRepo.find({ relations: ['venue'], order: { displayOrder: 'ASC' } });
  }

  findOne(imageId: number) {
    return this.venueImageRepo.findOne({ where: { imageId }, relations: ['venue'] });
  }

  update(imageId: number, updateDto: UpdateVenueImageDto) {
    return this.venueImageRepo.update({ imageId }, updateDto);
  }

  remove(imageId: number) {
    return this.venueImageRepo.delete({ imageId });
  }

  findByVenue(venueId: number) {
    return this.venueImageRepo.find({ where: { venueId }, order: { displayOrder: 'ASC' } });
  }
}
