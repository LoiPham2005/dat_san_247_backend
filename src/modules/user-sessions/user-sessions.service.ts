import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from './entities/user-session.entity';
import { CreateUserSessionDto } from './dto/create-user-session.dto';
import { UpdateUserSessionDto } from './dto/update-user-session.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class UserSessionsService {
    constructor(
        @InjectRepository(UserSession)
        private readonly userSessionRepo: Repository<UserSession>,
    ) { }

    async create(createDto: CreateUserSessionDto) {
        const session = this.userSessionRepo.create(createDto);
        const saved = await this.userSessionRepo.save(session);
        return success(saved, 'Tạo session thành công');
    }

    async findAll() {
        const sessions = await this.userSessionRepo.find();
        return success(sessions, 'Lấy danh sách session thành công');
    }

    async findOne(sessionId: string) {
        const session = await this.userSessionRepo.findOne({ where: { sessionId } });
        return success(session, 'Lấy thông tin session thành công');
    }

    async update(sessionId: string, updateDto: UpdateUserSessionDto) {
        await this.userSessionRepo.update({ sessionId }, updateDto);
        const updated = await this.userSessionRepo.findOne({ where: { sessionId } });
        return success(updated, 'Cập nhật session thành công');
    }

    async remove(sessionId: string) {
        const session = await this.userSessionRepo.findOne({ where: { sessionId } });
        if (!session) {
            // Nếu bạn đã có AllExceptionsFilter, có thể ném NotFoundException
            throw new NotFoundException(`Session với ID ${sessionId} không tồn tại`);
        }
        const removed = await this.userSessionRepo.remove(session);
        return success(removed, 'Xóa session thành công');
    }

}
