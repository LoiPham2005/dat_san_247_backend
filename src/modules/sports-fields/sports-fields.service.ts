// src/modules/sports-field/sports-field.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { SportsField } from './entities/sports-fields.entities';
import { CreateSportsFieldDto } from './dto/sports-fields.dto';
import { UpdateSportsFieldDto } from './dto/update-sports-field.dto';

@Injectable()
export class SportsFieldService {
  constructor(
    @InjectRepository(SportsField)
    private readonly sportsFieldRepo: Repository<SportsField>,
  ) {}

  async create(dto: CreateSportsFieldDto, owner: User): Promise<SportsField> {
    const field = this.sportsFieldRepo.create({ ...dto, owner });
    return this.sportsFieldRepo.save(field);
  }

  async findAll(): Promise<SportsField[]> {
    return this.sportsFieldRepo.find({ relations: ['owner'] });
  }

  async findByOwner(ownerId: number): Promise<SportsField[]> {
    return this.sportsFieldRepo.find({ where: { owner: { id: ownerId } }, relations: ['owner'] });
  }

  async findOne(id: number): Promise<SportsField> {
    const field = await this.sportsFieldRepo.findOne({ where: { id }, relations: ['owner'] });
    if (!field) throw new NotFoundException(`SportsField with id ${id} not found`);
    return field;
  }

  async update(id: number, dto: UpdateSportsFieldDto): Promise<SportsField> {
    const field = await this.findOne(id);
    Object.assign(field, dto);
    return this.sportsFieldRepo.save(field);
  }

  async remove(id: number): Promise<void> {
    const field = await this.findOne(id);
    await this.sportsFieldRepo.remove(field);
  }
}
