import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepo: Repository<Banner>,
  ) {}

  async create(createDto: CreateBannerDto) {
    const banner = this.bannerRepo.create(createDto);
    const saved = await this.bannerRepo.save(banner);
    return success(saved, 'Tạo banner thành công');
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

  async update(bannerId: number, updateDto: UpdateBannerDto) {
    const result = await this.bannerRepo.update({ bannerId }, updateDto);
    // Lấy lại bản cập nhật để trả về
    const updatedBanner = await this.bannerRepo.findOne({ where: { bannerId } });
    return success(updatedBanner, 'Cập nhật banner thành công');
  }

  async remove(bannerId: number) {
    const banner = await this.bannerRepo.findOne({ where: { bannerId } });
    if (!banner) {
      return success(null, 'Banner không tồn tại');
    }
    await this.bannerRepo.remove(banner);
    return success(banner, 'Xóa banner thành công');
  }
}
