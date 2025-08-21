import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { UpdateRefreshTokenDto } from './dto/update-refresh-token.dto';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  create(createDto: CreateRefreshTokenDto) {
    const token = this.refreshTokenRepo.create(createDto);
    return this.refreshTokenRepo.save(token);
  }

  findAll() {
    return this.refreshTokenRepo.find();
  }

  findOne(id: number) {
    return this.refreshTokenRepo.findOne({ where: { id } });
  }

  update(id: number, updateDto: UpdateRefreshTokenDto) {
    return this.refreshTokenRepo.update({ id }, updateDto);
  }

  remove(id: number) {
    return this.refreshTokenRepo.delete({ id });
  }

  revokeToken(id: number) {
    return this.refreshTokenRepo.update({ id }, { isRevoked: true });
  }
}
