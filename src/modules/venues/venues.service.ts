import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Venue } from './entities/venue.entity';
import { ImageType, VenueImage } from '../venue-images/entities/venue-image.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class VenuesService {
    constructor(
        @InjectRepository(Venue)
        private readonly venueRepo: Repository<Venue>,
    ) { }

    async create(createDto: CreateVenueDto) {
        try {
            const venue = this.venueRepo.create(createDto);
            const savedVenue = await this.venueRepo.save(venue);
            return success(savedVenue, 'Tạo sân thành công');
        } catch (error) {
            throw new BadRequestException('Tạo sân thất bại: ' + error.message);
        }
    }

    // async findAll() {
    //     const venues = await this.venueRepo.find({
    //         relations: ['owner', 'category', 'mainImage', 'images'],
    //         order: { createdAt: 'DESC' }
    //     });
    //     return success(venues, 'Lấy danh sách venue thành công');
    // }

    async findAll(page: number = 1, limit: number = 10) {
        // đảm bảo luôn là số
        page = Number(page) || 1;
        limit = Number(limit) || 10;

        if (page < 1) page = 1;
        if (limit < 1) limit = 10;

        const [venues, total] = await this.venueRepo.findAndCount({
            relations: ['owner', 'category', 'mainImage', 'images'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return success(
            {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                data: venues,
            },
            'Lấy danh sách venue thành công',
        );
    }

    async findOne(venueId: number) {
        const venue = await this.venueRepo.findOne({
            where: { venueId },
            relations: ['owner', 'category', 'mainImage', 'images']
        });
        if (!venue) throw new NotFoundException('Venue không tồn tại');
        return success(venue, 'Lấy chi tiết venue thành công');
    }

    async update(venueId: number, updateDto: UpdateVenueDto) {
        const venue = await this.venueRepo.findOne({ where: { venueId } });
        if (!venue) throw new NotFoundException('Venue không tồn tại');

        // Cập nhật thông tin venue
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

    async setMainImage(venueId: number, imageId: number) {
        const venue = await this.venueRepo.findOne({ where: { venueId } });
        if (!venue) throw new NotFoundException('Venue không tồn tại');

        venue.mainImageId = imageId;
        const updated = await this.venueRepo.save(venue);
        return success(updated, 'Cập nhật ảnh chính thành công');
    }

    async search(keyword: string, page: number = 1, limit: number = 10) {
        if (!keyword || keyword.trim() === '') {
            throw new BadRequestException('Vui lòng nhập từ khóa tìm kiếm');
        }

        // Đảm bảo page và limit là số
        page = Number(page) || 1;
        limit = Number(limit) || 10;

        if (page < 1) page = 1;
        if (limit < 1) limit = 10;

        const queryBuilder = this.venueRepo
            .createQueryBuilder('venue')
            .leftJoinAndSelect('venue.owner', 'owner')
            .leftJoinAndSelect('venue.category', 'category')
            .leftJoinAndSelect('venue.mainImage', 'mainImage')
            .leftJoinAndSelect('venue.images', 'images')
            .where('venue.venueName ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('venue.address ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('venue.description ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('venue.email ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('venue.phone ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('owner.fullname ILIKE :keyword', { keyword: `%${keyword}%` })
            .orWhere('category.categoryName ILIKE :keyword', { keyword: `%${keyword}%` })
            .orderBy('venue.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        const [venues, total] = await queryBuilder.getManyAndCount();

        return success({
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            data: venues
        }, 'Tìm kiếm venue thành công');
    }

}
