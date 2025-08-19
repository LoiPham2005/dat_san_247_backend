// src/modules/reviews/review.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { SportsField } from '../sports-fields/entities/sports-fields.entities';
import { User } from '../auth/entities/user.entity';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(SportsField)
    private readonly fieldRepo: Repository<SportsField>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateReviewDto): Promise<Review> {
    const field = await this.fieldRepo.findOne({ where: { id: dto.field_id } });
    if (!field) throw new NotFoundException(`SportsField with id ${dto.field_id} not found`);

    const customer = await this.userRepo.findOne({ where: { id: dto.customer_id } });
    if (!customer) throw new NotFoundException(`User with id ${dto.customer_id} not found`);

    const review = this.reviewRepo.create({ ...dto, field, customer });
    return this.reviewRepo.save(review);
  }

  async findAll(): Promise<Review[]> {
    return this.reviewRepo.find({ relations: ['field', 'customer'] });
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepo.findOne({ where: { id }, relations: ['field', 'customer'] });
    if (!review) throw new NotFoundException(`Review with id ${id} not found`);
    return review;
  }

  async update(id: number, dto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);
    Object.assign(review, dto);
    return this.reviewRepo.save(review);
  }

  async remove(id: number): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewRepo.remove(review);
  }

  async findByField(fieldId: number): Promise<Review[]> {
    return this.reviewRepo.find({ where: { field: { id: fieldId } }, relations: ['customer'] });
  }

  async findByCustomer(customerId: number): Promise<Review[]> {
    return this.reviewRepo.find({ where: { customer: { id: customerId } }, relations: ['field'] });
  }
}
