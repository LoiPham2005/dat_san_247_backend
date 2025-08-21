import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  create(createDto: CreateBookingDto) {
    const booking = this.bookingRepo.create(createDto);
    return this.bookingRepo.save(booking);
  }

  findAll() {
    return this.bookingRepo.find({ relations: ['customer', 'venue'], order: { bookingDate: 'DESC' } });
  }

  findOne(bookingId: number) {
    return this.bookingRepo.findOne({ where: { bookingId }, relations: ['customer', 'venue'] });
  }

  findByCustomer(customerId: number) {
    return this.bookingRepo.find({ where: { customerId }, order: { bookingDate: 'DESC' } });
  }

  findByVenue(venueId: number) {
    return this.bookingRepo.find({ where: { venueId }, order: { bookingDate: 'DESC' } });
  }

  update(bookingId: number, updateDto: UpdateBookingDto) {
    return this.bookingRepo.update({ bookingId }, updateDto);
  }

  remove(bookingId: number) {
    return this.bookingRepo.delete({ bookingId });
  }
}
