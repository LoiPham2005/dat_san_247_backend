import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VenueOperatingHour } from './entities/venue-operating-hour.entity';
import { CreateVenueOperatingHourDto } from './dto/create-venue-operating-hour.dto';
import { UpdateVenueOperatingHourDto } from './dto/update-venue-operating-hour.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class VenueOperatingHoursService {
    constructor(
        @InjectRepository(VenueOperatingHour)
        private readonly operatingHourRepo: Repository<VenueOperatingHour>,
    ) { }

    async create(createDto: CreateVenueOperatingHourDto) {
        const hour = this.operatingHourRepo.create(createDto);
        const saved = await this.operatingHourRepo.save(hour);
        return success(saved, 'Tạo giờ hoạt động thành công');
    }

    async findAll() {
        const hours = await this.operatingHourRepo.find({ relations: ['venue'] });
        return success(hours, 'Lấy danh sách giờ hoạt động thành công');
    }

    async findOne(scheduleId: number) {
        const hour = await this.operatingHourRepo.findOne({ where: { scheduleId }, relations: ['venue'] });
        if (!hour) throw new NotFoundException('Giờ hoạt động không tồn tại');
        return success(hour, 'Lấy chi tiết giờ hoạt động thành công');
    }

    async findByVenue(venueId: number) {
        const hours = await this.operatingHourRepo.find({ where: { venueId }, order: { dayOfWeek: 'ASC' } });
        return success(hours, 'Lấy danh sách giờ hoạt động theo venue thành công');
    }

    async update(scheduleId: number, updateDto: UpdateVenueOperatingHourDto) {
        const hour = await this.operatingHourRepo.findOne({ where: { scheduleId } });
        if (!hour) throw new NotFoundException('Giờ hoạt động không tồn tại');
        Object.assign(hour, updateDto);
        const updated = await this.operatingHourRepo.save(hour);
        return success(updated, 'Cập nhật giờ hoạt động thành công');
    }

    async remove(scheduleId: number) {
        const hour = await this.operatingHourRepo.findOne({ where: { scheduleId } });
        if (!hour) throw new NotFoundException('Giờ hoạt động không tồn tại');
        const removed = await this.operatingHourRepo.remove(hour);
        return success(removed, 'Xóa giờ hoạt động thành công');
    }
}
