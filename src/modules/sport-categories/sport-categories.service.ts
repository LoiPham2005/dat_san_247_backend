import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SportCategory } from './entities/sport-category.entity';
import { CreateSportCategoryDto } from './dto/create-sport-category.dto';
import { UpdateSportCategoryDto } from './dto/update-sport-category.dto';

@Injectable()
export class SportCategoriesService {
  constructor(
    @InjectRepository(SportCategory)
    private readonly sportCategoryRepo: Repository<SportCategory>,
  ) {}

  create(createDto: CreateSportCategoryDto) {
    const category = this.sportCategoryRepo.create(createDto);
    return this.sportCategoryRepo.save(category);
  }

  findAll() {
    return this.sportCategoryRepo.find({ order: { displayOrder: 'ASC' } });
  }

  findOne(categoryId: number) {
    return this.sportCategoryRepo.findOne({ where: { categoryId } });
  }

  update(categoryId: number, updateDto: UpdateSportCategoryDto) {
    return this.sportCategoryRepo.update({ categoryId }, updateDto);
  }

  remove(categoryId: number) {
    return this.sportCategoryRepo.delete({ categoryId });
  }
}
