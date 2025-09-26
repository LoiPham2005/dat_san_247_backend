import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SportCategory } from './entities/sport-category.entity';
import { CreateSportCategoryDto } from './dto/create-sport-category.dto';
import { UpdateSportCategoryDto } from './dto/update-sport-category.dto';
import { FileUploadHelper } from 'src/common/helper/file-upload.helper';
import { EntityHelper } from 'src/common/helper/entity.helper';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class SportCategoriesService {
  constructor(
    @InjectRepository(SportCategory)
    private readonly repo: Repository<SportCategory>,
    private readonly fileUploadHelper: FileUploadHelper,
    private readonly entityHelper: EntityHelper,
  ) { }

/** Tạo mới */
async create(dto: CreateSportCategoryDto, file?: Express.Multer.File) {
  try {
    if (file) {
      const upload = await this.fileUploadHelper.replaceFile(file, 'categories');
      if (upload) {   // ✅ check null
        dto.iconUrl = upload.media;
        dto.cloudinaryId = upload.cloudinaryId;
      }
    }

    const entity = this.repo.create(dto);
    return success(await this.repo.save(entity), 'Tạo danh mục thành công');
  } catch (err) {
    throw new BadRequestException('Tạo danh mục thất bại: ' + err.message);
  }
}

  /** Lấy tất cả */
  async findAll() {
    const items = await this.repo.find({ order: { displayOrder: 'ASC' } });
    return success(items, 'Lấy danh sách danh mục thành công');
  }

  /** Lấy theo ID */
  async findOne(id: number) {
    const entity = await this.entityHelper.findOrFail(
      this.repo,
      { categoryId: id },
      `Danh mục ID ${id} không tồn tại`,
    );
    return success(entity, 'Lấy thông tin danh mục thành công');
  }

/** Cập nhật */
async update(
  id: number,
  dto: UpdateSportCategoryDto,
  file?: Express.Multer.File,
) {
  try {
    const entity = await this.entityHelper.findOrFail(
      this.repo,
      { categoryId: id },
      `Danh mục ID ${id} không tồn tại`,
    );

    if (file) {
      const upload = await this.fileUploadHelper.replaceFile(
        file,
        'categories',
        entity.cloudinaryId,
      );
      if (upload) {   // ✅ check null
        dto.iconUrl = upload.media;
        dto.cloudinaryId = upload.cloudinaryId;
      }
    }

    Object.assign(entity, dto);
    return success(await this.repo.save(entity), 'Cập nhật danh mục thành công');
  } catch (err) {
    throw new BadRequestException('Cập nhật thất bại: ' + err.message);
  }
}

  /** Xóa */
  async remove(id: number) {
    const entity = await this.entityHelper.findOrFail(
      this.repo,
      { categoryId: id },
      `Danh mục ID ${id} không tồn tại`,
    );

    // const entity = await this.repo.findOne({ where: { categoryId: id } });
    // if (!entity) throw new NotFoundException(`Danh mục ID ${id} không tồn tại`);

    if (entity.cloudinaryId) {
      await this.fileUploadHelper.deleteFile(entity.cloudinaryId);
    }
    await this.repo.delete({ categoryId: id });

    return success(null, 'Xóa danh mục thành công');
  }

}