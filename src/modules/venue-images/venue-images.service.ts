import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VenueImage } from './entities/venue-image.entity';
import { CreateVenueImageDto } from './dto/create-venue-image.dto';
import { UpdateVenueImageDto } from './dto/update-venue-image.dto';
import { FileUploadHelper } from 'src/common/helper/file-upload.helper';
import { EntityHelper } from 'src/common/helper/entity.helper';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class VenueImagesService {
  constructor(
    @InjectRepository(VenueImage)
    private readonly venueImageRepo: Repository<VenueImage>,
    private readonly fileUploadHelper: FileUploadHelper,
    private readonly entityHelper: EntityHelper,
  ) {}

  /** Tạo mới */
  async create(dto: CreateVenueImageDto, file?: Express.Multer.File) {
    try {
      if (file) {
        const upload = await this.fileUploadHelper.replaceFile(file, 'venues');
        if (upload) {  // ✅ check null
          dto.imageUrl = upload.media;
          dto.cloudinaryId = upload.cloudinaryId;
        }
      }

      const entity = this.venueImageRepo.create(dto);
      return success(await this.venueImageRepo.save(entity), 'Tạo ảnh venue thành công');
    } catch (err) {
      throw new BadRequestException('Tạo ảnh venue thất bại: ' + err.message);
    }
  }

  /** Lấy tất cả */
  async findAll() {
    const images = await this.venueImageRepo.find({
      relations: ['venue'],
      order: { displayOrder: 'ASC' },
    });
    return success(images, 'Lấy danh sách ảnh venue thành công');
  }

  /** Lấy theo ID */
  async findOne(imageId: number) {
    const image = await this.entityHelper.findOrFail(
      this.venueImageRepo,
      { imageId },
      'Ảnh venue không tồn tại',
    );
    return success(image, 'Lấy chi tiết ảnh venue thành công');
  }

  /** Cập nhật */
  async update(imageId: number, dto: UpdateVenueImageDto, file?: Express.Multer.File) {
    try {
      const image = await this.entityHelper.findOrFail(
        this.venueImageRepo,
        { imageId },
        'Ảnh venue không tồn tại',
      );

      if (file) {
        const upload = await this.fileUploadHelper.replaceFile(
          file,
          'venues',
          image.cloudinaryId,
        );
        if (upload) {
          dto.imageUrl = upload.media;
          dto.cloudinaryId = upload.cloudinaryId;
        }
      }

      Object.assign(image, dto);
      return success(await this.venueImageRepo.save(image), 'Cập nhật ảnh venue thành công');
    } catch (err) {
      throw new BadRequestException('Cập nhật ảnh venue thất bại: ' + err.message);
    }
  }

  /** Xóa */
  async remove(imageId: number) {
    const image = await this.entityHelper.findOrFail(
      this.venueImageRepo,
      { imageId },
      'Ảnh venue không tồn tại',
    );

    if (image.cloudinaryId) {
      await this.fileUploadHelper.deleteFile(image.cloudinaryId);
    }
    await this.venueImageRepo.delete({ imageId });

    return success(null, 'Xóa ảnh venue thành công');
  }

  /** Lấy danh sách theo venue */
  async findByVenue(venueId: number) {
    const images = await this.venueImageRepo.find({
      where: { venueId },
      order: { displayOrder: 'ASC' },
    });
    return success(images, 'Lấy danh sách ảnh theo venue thành công');
  }
}
