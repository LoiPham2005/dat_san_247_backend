import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from './entities/venue.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class VenuesService {
    constructor(
        @InjectRepository(Venue)
        private readonly venueRepo: Repository<Venue>,
    ) { }

    async create(createDto: CreateVenueDto) {
        const venue = this.venueRepo.create(createDto);
        const saved = await this.venueRepo.save(venue);
        return success(saved, 'Tạo venue thành công');
    }

    async findAll() {
        const venues = await this.venueRepo.find({ relations: ['owner', 'category'] });
        return success(venues, 'Lấy danh sách venue thành công');
    }

    async findOne(venueId: number) {
        const venue = await this.venueRepo.findOne({ where: { venueId }, relations: ['owner', 'category'] });
        if (!venue) throw new NotFoundException('Venue không tồn tại');
        return success(venue, 'Lấy chi tiết venue thành công');
    }

    async update(venueId: number, updateDto: UpdateVenueDto) {
        const venue = await this.venueRepo.findOne({ where: { venueId } });
        if (!venue) throw new NotFoundException('Venue không tồn tại');
        Object.assign(venue, updateDto);
        const updated = await this.venueRepo.save(venue);
        return success(updated, 'Cập nhật venue thành công');
    }

    async remove(venueId: number) {
        const venue = await this.venueRepo.findOne({ where: { venueId } });
        if (!venue) throw new NotFoundException('Venue không tồn tại');
        const removed = await this.venueRepo.remove(venue);
        return success(removed, 'Xóa venue thành công');
    }
}
