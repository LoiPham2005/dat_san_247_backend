// src/modules/field-images/field-image.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFieldImageDto } from './dto/create-field-image.dto';
import { UpdateFieldImageDto } from './dto/update-field-image.dto';
import { FieldImage } from './entities/field-image.entity';
import { SportsField } from '../sports-fields/entities/sports-fields.entities';

@Injectable()
export class FieldImageService {
  constructor(
    @InjectRepository(FieldImage)
    private readonly imageRepo: Repository<FieldImage>,
    @InjectRepository(SportsField)
    private readonly fieldRepo: Repository<SportsField>,
  ) {}

  async create(dto: CreateFieldImageDto): Promise<FieldImage> {
    const field = await this.fieldRepo.findOne({ where: { id: dto.field_id } });
    if (!field) throw new NotFoundException(`SportsField with id ${dto.field_id} not found`);

    const image = this.imageRepo.create({ ...dto, field });
    return this.imageRepo.save(image);
  }

  async findAll(): Promise<FieldImage[]> {
    return this.imageRepo.find({ relations: ['field'] });
  }

  async findByField(fieldId: number): Promise<FieldImage[]> {
    return this.imageRepo.find({ where: { field: { id: fieldId } }, relations: ['field'] });
  }

  async findOne(id: number): Promise<FieldImage> {
    const image = await this.imageRepo.findOne({ where: { id }, relations: ['field'] });
    if (!image) throw new NotFoundException(`FieldImage with id ${id} not found`);
    return image;
  }

  async update(id: number, dto: UpdateFieldImageDto): Promise<FieldImage> {
    const image = await this.findOne(id);
    Object.assign(image, dto);
    return this.imageRepo.save(image);
  }

  async remove(id: number): Promise<void> {
    const image = await this.findOne(id);
    await this.imageRepo.remove(image);
  }
}
