import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnerResponse } from './entities/partner-response.entity';
import { CreatePartnerResponseDto } from './dto/create-partner-response.dto';
import { UpdatePartnerResponseDto } from './dto/update-partner-response.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class PartnerResponsesService {
    constructor(
        @InjectRepository(PartnerResponse)
        private readonly repo: Repository<PartnerResponse>,
    ) { }

    async create(createDto: CreatePartnerResponseDto) {
        const entity = this.repo.create(createDto);
        const saved = await this.repo.save(entity);
        return success(saved, 'Tạo phản hồi hợp tác thành công');
    }

    async findAll() {
        const responses = await this.repo.find({
            relations: ['request', 'responder'],
        });
        return success(responses, 'Lấy danh sách phản hồi hợp tác thành công');
    }

    async findOne(responseId: number) {
        const response = await this.repo.findOne({
            where: { responseId },
            relations: ['request', 'responder'],
        });
        return success(response, 'Lấy chi tiết phản hồi hợp tác thành công');
    }

    async update(responseId: number, updateDto: UpdatePartnerResponseDto) {
        const result = await this.repo.update(responseId, updateDto);
        return success(result, 'Cập nhật phản hồi hợp tác thành công');
    }

    async remove(responseId: number) {
        const result = await this.repo.delete(responseId);
        return success(result, 'Xóa phản hồi hợp tác thành công');
    }

    async findByRequest(requestId: number) {
        const responses = await this.repo.find({
            where: { requestId },
            relations: ['responder'],
        });
        return success(responses, 'Lấy danh sách phản hồi theo yêu cầu thành công');
    }
}
