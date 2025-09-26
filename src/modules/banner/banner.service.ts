import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { success } from 'src/common/helper/response.helper';
import { FileUploadHelper } from 'src/common/helper/file-upload.helper';
import { EntityHelper } from 'src/common/helper/entity.helper';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly repo: Repository<Banner>,
        private readonly fileUploadHelper: FileUploadHelper,
        private readonly entityHelper: EntityHelper,
  ) { }

  // async create(createDto: CreateBannerDto, file?: Express.Multer.File) {
  //   try {
  //     if (file) {
  //       const timestamp = Date.now();
  //       const uniqueSuffix = `${timestamp}-${Math.round(Math.random() * 1E9)}`;

  //       const result = await this.cloudinaryService.uploadFile(file, {
  //         folder: 'banners',
  //         public_id: uniqueSuffix,
  //         resource_type: 'auto',
  //         transformation: [
  //           { width: 1000, height: 1000, crop: 'limit' },
  //           { quality: 'auto:good' }
  //         ]
  //       });

  //       createDto.mediaUrl = result.secure_url;
  //       createDto.cloudinaryId = result.public_id; // Lưu cloudinary_id
  //     }

  //     const banner = this.bannerRepo.create(createDto);
  //     const saved = await this.bannerRepo.save(banner);
  //     return success(saved, 'Tạo banner thành công');
  //   } catch (error) {
  //     throw new BadRequestException('Tạo banner thất bại: ' + error.message);
  //   }
  // }

  /** Tạo mới */
async create(dto: CreateBannerDto, file?: Express.Multer.File) {
  try {
    if (file) {
      const upload = await this.fileUploadHelper.replaceFile(file, 'banners');
      if (upload) {   // ✅ check null
        dto.mediaUrl = upload.media;
        dto.cloudinaryId = upload.cloudinaryId;
      }
    }

    const entity = this.repo.create(dto);
    return success(await this.repo.save(entity), 'Tạo banner thành công');
  } catch (err) {
    throw new BadRequestException('Tạo banner thất bại: ' + err.message);
  }
}

  async findAll() {
    const banners = await this.repo.find({
      order: { createdAt: 'DESC' },
    });
    return success(banners, 'Lấy danh sách banner thành công');
  }

  async findOne(bannerId: number) {
    const banner = await this.repo.findOne({ where: { bannerId } });
    return success(banner, 'Lấy chi tiết banner thành công');
  }

  // async update(bannerId: number, updateDto: UpdateBannerDto, file?: Express.Multer.File) {
  //   try {
  //     const banner = await this.repo.findOne({ where: { bannerId } });
  //     if (!banner) {
  //       throw new BadRequestException('Banner không tồn tại');
  //     }

  //     if (file) {
  //       // Xóa file cũ trên Cloudinary nếu có
  //       if (banner.cloudinaryId) {
  //         await this.cloudinaryService.deleteFile(banner.cloudinaryId);
  //       }

  //       // Upload file mới
  //       const timestamp = Date.now();
  //       const uniqueSuffix = `${timestamp}-${Math.round(Math.random() * 1E9)}`;

  //       const result = await this.cloudinaryService.uploadFile(file, {
  //         folder: 'banners',
  //         public_id: uniqueSuffix,
  //         resource_type: 'auto',
  //         transformation: [
  //           { width: 1000, height: 1000, crop: 'limit' },
  //           { quality: 'auto:good' }
  //         ]
  //       });

  //       updateDto.mediaUrl = result.secure_url;
  //       updateDto.cloudinaryId = result.public_id;
  //     }

  //     Object.assign(banner, updateDto);
  //     const updated = await this.repo.save(banner);
  //     return success(updated, 'Cập nhật banner thành công');
  //   } catch (error) {
  //     throw new BadRequestException('Cập nhật banner thất bại: ' + error.message);
  //   }
  // }


  /** Cập nhật */
  async update(
    id: number,
    dto: UpdateBannerDto,
    file?: Express.Multer.File,
  ) {
    try {
      const entity = await this.entityHelper.findOrFail(
        this.repo,
        { bannerId: id },
        `Danh mục ID ${id} không tồn tại`,
      );
  
      if (file) {
        const upload = await this.fileUploadHelper.replaceFile(
          file,
          'banners',
          entity.cloudinaryId,
        );
        if (upload) {   // ✅ check null
          dto.mediaUrl = upload.media;
          dto.cloudinaryId = upload.cloudinaryId;
        }
      }
  
      Object.assign(entity, dto);
      return success(await this.repo.save(entity), 'Cập nhật banner thành công');
    } catch (err) {
      throw new BadRequestException('Cập nhật thất bại: ' + err.message);
    }
  }

   /** Xóa */
  async remove(id: number) {
    const entity = await this.entityHelper.findOrFail(
      this.repo,
      { bannerId: id },
      `banner ID ${id} không tồn tại`,
    );

    // const entity = await this.repo.findOne({ where: { categoryId: id } });
    // if (!entity) throw new NotFoundException(`Danh mục ID ${id} không tồn tại`);

    if (entity.cloudinaryId) {
      await this.fileUploadHelper.deleteFile(entity.cloudinaryId);
    }
    await this.repo.delete({ bannerId: id });

    return success(null, 'Xóa banner thành công');
  }

}
