// src/modules/bookings/booking.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { SportsField } from '../sports-fields/entities/sports-fields.entities';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(SportsField)
    private readonly fieldRepo: Repository<SportsField>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateBookingDto): Promise<Booking> {
    const field = await this.fieldRepo.findOne({ where: { id: dto.field_id } });
    if (!field) throw new NotFoundException(`SportsField with id ${dto.field_id} not found`);

    const customer = await this.userRepo.findOne({ where: { id: dto.customer_id } });
    if (!customer) throw new NotFoundException(`User with id ${dto.customer_id} not found`);

    const booking = this.bookingRepo.create({ ...dto, field, customer });
    return this.bookingRepo.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepo.find({ relations: ['field', 'customer'] });
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({ where: { id }, relations: ['field', 'customer'] });
    if (!booking) throw new NotFoundException(`Booking with id ${id} not found`);
    return booking;
  }

  async update(id: number, dto: UpdateBookingDto): Promise<Booking> {
    const booking = await this.findOne(id);
    Object.assign(booking, dto);
    return this.bookingRepo.save(booking);
  }

  async remove(id: number): Promise<void> {
    const booking = await this.findOne(id);
    await this.bookingRepo.remove(booking);
  }

  async findByCustomer(customerId: number): Promise<Booking[]> {
    return this.bookingRepo.find({ where: { customer: { id: customerId } }, relations: ['field', 'customer'] });
  }

  async findByField(fieldId: number): Promise<Booking[]> {
    return this.bookingRepo.find({ where: { field: { id: fieldId } }, relations: ['field', 'customer'] });
  }
}
