import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { UpdateRefreshTokenDto } from './dto/update-refresh-token.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class RefreshTokensService {
    constructor(
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepo: Repository<RefreshToken>,
    ) { }

    async create(createDto: CreateRefreshTokenDto) {
        const token = this.refreshTokenRepo.create(createDto);
        const saved = await this.refreshTokenRepo.save(token);
        return success(saved, 'Tạo refresh token thành công');
    }

    async findAll() {
        const tokens = await this.refreshTokenRepo.find();
        return success(tokens, 'Lấy danh sách refresh token thành công');
    }

    async findOne(id: number) {
        const token = await this.refreshTokenRepo.findOne({ where: { id } });
        return success(token, 'Lấy chi tiết refresh token thành công');
    }

    async update(id: number, updateDto: UpdateRefreshTokenDto) {
        const result = await this.refreshTokenRepo.update({ id }, updateDto);
        return success(result, 'Cập nhật refresh token thành công');
    }

    async remove(id: number) {
        const result = await this.refreshTokenRepo.delete({ id });
        return success(result, 'Xóa refresh token thành công');
    }

    async revokeToken(id: number) {
        const result = await this.refreshTokenRepo.update({ id }, { isRevoked: true });
        return success(result, 'Thu hồi refresh token thành công');
    }
}
