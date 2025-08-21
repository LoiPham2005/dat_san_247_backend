import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from './entities/user-session.entity';
import { CreateUserSessionDto } from './dto/create-user-session.dto';
import { UpdateUserSessionDto } from './dto/update-user-session.dto';

@Injectable()
export class UserSessionsService {
  constructor(
    @InjectRepository(UserSession)
    private readonly userSessionRepo: Repository<UserSession>,
  ) {}

  create(createDto: CreateUserSessionDto) {
    const session = this.userSessionRepo.create(createDto);
    return this.userSessionRepo.save(session);
  }

  findAll() {
    return this.userSessionRepo.find();
  }

  findOne(sessionId: string) {
    return this.userSessionRepo.findOne({ where: { sessionId } });
  }

  update(sessionId: string, updateDto: UpdateUserSessionDto) {
    return this.userSessionRepo.update({ sessionId }, updateDto);
  }

  remove(sessionId: string) {
    return this.userSessionRepo.delete({ sessionId });
  }
}
