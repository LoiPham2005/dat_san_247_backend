import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepo: Repository<Banner>,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async create(createDto: CreateBannerDto, file?: Express.Multer.File) {
    try {
      if (file) {
        const result = await this.cloudinaryService.uploadFile(file, 'banners');
        createDto.mediaUrl = result.secure_url;
      }

      const banner = this.bannerRepo.create(createDto);
      const saved = await this.bannerRepo.save(banner);
      return success(saved, 'Tạo banner thành công');
    } catch (error) {
      throw new BadRequestException('Tạo banner thất bại: ' + error.message);
    }
  }

  async findAll() {
    const banners = await this.bannerRepo.find({
      order: { createdAt: 'DESC' },
    });
    return success(banners, 'Lấy danh sách banner thành công');
  }

  async findOne(bannerId: number) {
    const banner = await this.bannerRepo.findOne({ where: { bannerId } });
    return success(banner, 'Lấy chi tiết banner thành công');
  }

  async update(bannerId: number, updateDto: UpdateBannerDto, file?: Express.Multer.File) {
    try {
      const banner = await this.bannerRepo.findOne({ where: { bannerId } });
      if (!banner) {
        throw new BadRequestException('Banner không tồn tại');
      }

      if (file) {
        // Upload file mới lên Cloudinary
        const result = await this.cloudinaryService.uploadFile(file, 'banners');
        updateDto.mediaUrl = result.secure_url;

        // Xóa file cũ trên Cloudinary nếu có
        if (banner.mediaUrl) {
          const oldPublicId = this.getPublicIdFromUrl(banner.mediaUrl);
          if (oldPublicId) {
            await this.cloudinaryService.deleteFile(oldPublicId);
          }
        }
      }

      Object.assign(banner, updateDto);
      const updated = await this.bannerRepo.save(banner);
      return success(updated, 'Cập nhật banner thành công');
    } catch (error) {
      throw new BadRequestException('Cập nhật banner thất bại: ' + error.message);
    }
  }

  async remove(bannerId: number) {
    const banner = await this.bannerRepo.findOne({ where: { bannerId } });
    if (!banner) {
      return success(null, 'Banner không tồn tại');
    }

    // Xóa file trên Cloudinary nếu có
    if (banner.mediaUrl) {
      const publicId = this.getPublicIdFromUrl(banner.mediaUrl);
      if (publicId) {
        await this.cloudinaryService.deleteFile(publicId);
      }
    }

    await this.bannerRepo.remove(banner);
    return success(banner, 'Xóa banner thành công');
  }

  private getPublicIdFromUrl(url: string): string | null {
    try {
      const splitUrl = url.split('/');
      const filename = splitUrl[splitUrl.length - 1];
      return filename.split('.')[0];
    } catch {
      return null;
    }
  }
}
