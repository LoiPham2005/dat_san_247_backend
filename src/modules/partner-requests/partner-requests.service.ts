import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnerRequest } from './entities/partner-request.entity';
import { CreatePartnerRequestDto } from './dto/create-partner-request.dto';
import { UpdatePartnerRequestDto } from './dto/update-partner-request.dto';

@Injectable()
export class PartnerRequestsService {
  constructor(
    @InjectRepository(PartnerRequest)
    private readonly repo: Repository<PartnerRequest>,
  ) {}

  create(createDto: CreatePartnerRequestDto) {
    const entity = this.repo.create(createDto);
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ relations: ['requester', 'venue', 'sportCategory'] });
  }

  findOne(requestId: number) {
    return this.repo.findOne({ where: { requestId }, relations: ['requester', 'venue', 'sportCategory'] });
  }

  update(requestId: number, updateDto: UpdatePartnerRequestDto) {
    return this.repo.update(requestId, updateDto);
  }

  remove(requestId: number) {
    return this.repo.delete(requestId);
  }
}
