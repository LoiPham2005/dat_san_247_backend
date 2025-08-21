import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VenueImage } from './entities/venue-image.entity';
import { CreateVenueImageDto } from './dto/create-venue-image.dto';
import { UpdateVenueImageDto } from './dto/update-venue-image.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class VenueImagesService {
    constructor(
        @InjectRepository(VenueImage)
        private readonly venueImageRepo: Repository<VenueImage>,
    ) { }

    async create(createDto: CreateVenueImageDto) {
        const image = this.venueImageRepo.create(createDto);
        const saved = await this.venueImageRepo.save(image);
        return success(saved, 'Tạo ảnh venue thành công');
    }

    async findAll() {
        const images = await this.venueImageRepo.find({
            relations: ['venue'],
            order: { displayOrder: 'ASC' },
        });
        return success(images, 'Lấy danh sách ảnh venue thành công');
    }

    async findOne(imageId: number) {
        const image = await this.venueImageRepo.findOne({ where: { imageId }, relations: ['venue'] });
        if (!image) throw new NotFoundException('Ảnh venue không tồn tại');
        return success(image, 'Lấy chi tiết ảnh venue thành công');
    }

    async update(imageId: number, updateDto: UpdateVenueImageDto) {
        const image = await this.venueImageRepo.findOne({ where: { imageId } });
        if (!image) throw new NotFoundException('Ảnh venue không tồn tại');
        Object.assign(image, updateDto);
        const updated = await this.venueImageRepo.save(image);
        return success(updated, 'Cập nhật ảnh venue thành công');
    }

    async remove(imageId: number) {
        const image = await this.venueImageRepo.findOne({ where: { imageId } });
        if (!image) throw new NotFoundException('Ảnh venue không tồn tại');
        const removed = await this.venueImageRepo.remove(image);
        return success(removed, 'Xóa ảnh venue thành công');
    }

    async findByVenue(venueId: number) {
        const images = await this.venueImageRepo.find({ where: { venueId }, order: { displayOrder: 'ASC' } });
        return success(images, 'Lấy danh sách ảnh theo venue thành công');
    }
}
