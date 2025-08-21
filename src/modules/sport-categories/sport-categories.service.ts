import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SportCategory } from './entities/sport-category.entity';
import { CreateSportCategoryDto } from './dto/create-sport-category.dto';
import { UpdateSportCategoryDto } from './dto/update-sport-category.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class SportCategoriesService {
  constructor(
    @InjectRepository(SportCategory)
    private readonly sportCategoryRepo: Repository<SportCategory>,
  ) {}

  /** Tạo danh mục */
  async create(createDto: CreateSportCategoryDto) {
    const category = this.sportCategoryRepo.create(createDto);
    const savedCategory = await this.sportCategoryRepo.save(category);
    return success(savedCategory, 'Tạo danh mục thành công');
  }

  /** Lấy tất cả danh mục */
  async findAll() {
    const categories = await this.sportCategoryRepo.find({
      order: { displayOrder: 'ASC' },
    });
    return success(categories, 'Lấy danh sách danh mục thành công');
  }

  /** Lấy 1 danh mục theo ID */
  async findOne(categoryId: number) {
    const category = await this.sportCategoryRepo.findOne({
      where: { categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Danh mục ID ${categoryId} không tồn tại`);
    }
    return success(category, 'Lấy thông tin danh mục thành công');
  }

  /** Cập nhật danh mục */
  async update(categoryId: number, updateDto: UpdateSportCategoryDto) {
    const category = await this.sportCategoryRepo.findOne({ where: { categoryId } });
    if (!category) {
      throw new NotFoundException(`Danh mục ID ${categoryId} không tồn tại`);
    }

    Object.assign(category, updateDto);
    const updatedCategory = await this.sportCategoryRepo.save(category);
    return success(updatedCategory, 'Cập nhật danh mục thành công');
  }

  /** Xóa danh mục */
  async remove(categoryId: number) {
    const category = await this.sportCategoryRepo.findOne({ where: { categoryId } });
    if (!category) {
      throw new NotFoundException(`Danh mục ID ${categoryId} không tồn tại`);
    }

    await this.sportCategoryRepo.delete({ categoryId });
    return success(null, 'Xóa danh mục thành công');
  }
}
