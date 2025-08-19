// src/modules/complaints/complaint.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint } from './entities/complaint.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ComplaintService {
  constructor(
    @InjectRepository(Complaint)
    private readonly complaintRepo: Repository<Complaint>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateComplaintDto): Promise<Complaint> {
    const user = await this.userRepo.findOne({ where: { id: dto.user_id } });
    if (!user) throw new NotFoundException(`User with id ${dto.user_id} not found`);

    const complaint = this.complaintRepo.create({ ...dto, user });
    return this.complaintRepo.save(complaint);
  }

  async findAll(): Promise<Complaint[]> {
    return this.complaintRepo.find({ relations: ['user'], order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Complaint> {
    const complaint = await this.complaintRepo.findOne({ where: { id }, relations: ['user'] });
    if (!complaint) throw new NotFoundException(`Complaint with id ${id} not found`);
    return complaint;
  }

  async update(id: number, dto: UpdateComplaintDto): Promise<Complaint> {
    const complaint = await this.findOne(id);
    Object.assign(complaint, dto);
    return this.complaintRepo.save(complaint);
  }

  async remove(id: number): Promise<void> {
    const complaint = await this.findOne(id);
    await this.complaintRepo.remove(complaint);
  }

  async findByUser(userId: number): Promise<Complaint[]> {
    return this.complaintRepo.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
  }
}
