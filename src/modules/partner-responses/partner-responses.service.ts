import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnerResponse } from './entities/partner-response.entity';
import { CreatePartnerResponseDto } from './dto/create-partner-response.dto';
import { UpdatePartnerResponseDto } from './dto/update-partner-response.dto';

@Injectable()
export class PartnerResponsesService {
  constructor(
    @InjectRepository(PartnerResponse)
    private readonly repo: Repository<PartnerResponse>,
  ) {}

  create(createDto: CreatePartnerResponseDto) {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ relations: ['request', 'responder'] });
  }

  findOne(responseId: number) {
    return this.repo.findOne({ where: { responseId }, relations: ['request', 'responder'] });
  }

  update(responseId: number, updateDto: UpdatePartnerResponseDto) {
    return this.repo.update(responseId, updateDto);
  }

  remove(responseId: number) {
    return this.repo.delete(responseId);
  }

  findByRequest(requestId: number) {
    return this.repo.find({ where: { requestId }, relations: ['responder'] });
  }
}
