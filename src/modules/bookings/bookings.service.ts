import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking)
        private readonly bookingRepo: Repository<Booking>,
    ) { }

    async create(createDto: CreateBookingDto) {
        const booking = this.bookingRepo.create(createDto);
        const saved = await this.bookingRepo.save(booking);
        return success(saved, 'Tạo booking thành công');
    }

    async findAll() {
        const bookings = await this.bookingRepo.find({
            relations: ['customer', 'venue'],
            order: { bookingDate: 'DESC' },
        });
        return success(bookings, 'Lấy danh sách booking thành công');
    }

    async findOne(bookingId: number) {
        const booking = await this.bookingRepo.findOne({
            where: { bookingId },
            relations: ['customer', 'venue'],
        });
        return success(booking, 'Lấy chi tiết booking thành công');
    }

    async findByCustomer(customerId: number) {
        const bookings = await this.bookingRepo.find({
            where: { customerId },
            order: { bookingDate: 'DESC' },
        });
        return success(bookings, 'Lấy danh sách booking theo khách hàng thành công');
    }

    async findByVenue(venueId: number) {
        const bookings = await this.bookingRepo.find({
            where: { venueId },
            order: { bookingDate: 'DESC' },
        });
        return success(bookings, 'Lấy danh sách booking theo sân thành công');
    }

    async update(bookingId: number, updateDto: UpdateBookingDto) {
        const result = await this.bookingRepo.update({ bookingId }, updateDto);
        return success(result, 'Cập nhật booking thành công');
    }

    async remove(bookingId: number) {
        const result = await this.bookingRepo.delete({ bookingId });
        return success(result, 'Xóa booking thành công');
    }
}
