// src/modules/field-availability/field-availability.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldAvailability } from './entities/field-availability.entity';
import { CreateFieldAvailabilityDto } from './dto/create-field-availability.dto';
import { UpdateFieldAvailabilityDto } from './dto/update-field-availability.dto';
import { SportsField } from '../sports-fields/entities/sports-fields.entities';

@Injectable()
export class FieldAvailabilityService {
  constructor(
    @InjectRepository(FieldAvailability)
    private readonly availabilityRepo: Repository<FieldAvailability>,
    @InjectRepository(SportsField)
    private readonly fieldRepo: Repository<SportsField>,
  ) {}

  async create(dto: CreateFieldAvailabilityDto): Promise<FieldAvailability> {
    const field = await this.fieldRepo.findOne({ where: { id: dto.field_id } });
    if (!field) throw new NotFoundException(`Field with id ${dto.field_id} not found`);

    const availability = this.availabilityRepo.create({ ...dto, field });
    return this.availabilityRepo.save(availability);
  }

  async findAll(): Promise<FieldAvailability[]> {
    return this.availabilityRepo.find({ relations: ['field'], order: { day_of_week: 'ASC', start_time: 'ASC' } });
  }

  async findOne(id: number): Promise<FieldAvailability> {
    const availability = await this.availabilityRepo.findOne({ where: { id }, relations: ['field'] });
    if (!availability) throw new NotFoundException(`FieldAvailability with id ${id} not found`);
    return availability;
  }

  async update(id: number, dto: UpdateFieldAvailabilityDto): Promise<FieldAvailability> {
    const availability = await this.findOne(id);
    Object.assign(availability, dto);
    return this.availabilityRepo.save(availability);
  }

  async remove(id: number): Promise<void> {
    const availability = await this.findOne(id);
    await this.availabilityRepo.remove(availability);
  }

  async findByField(fieldId: number): Promise<FieldAvailability[]> {
    return this.availabilityRepo.find({ where: { field: { id: fieldId } }, order: { day_of_week: 'ASC', start_time: 'ASC' } });
  }
}
