import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PartnerRequest } from './entities/partner-request.entity';
import { CreatePartnerRequestDto } from './dto/create-partner-request.dto';
import { UpdatePartnerRequestDto } from './dto/update-partner-request.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class PartnerRequestsService {
    constructor(
        @InjectRepository(PartnerRequest)
        private readonly repo: Repository<PartnerRequest>,
    ) { }

    async create(createDto: CreatePartnerRequestDto) {
        const entity = this.repo.create(createDto);
        const saved = await this.repo.save(entity);
        return success(saved, 'Tạo yêu cầu hợp tác thành công');
    }

    async findAll() {
        const requests = await this.repo.find({
            relations: ['requester', 'venue', 'sportCategory'],
        });
        return success(requests, 'Lấy danh sách yêu cầu hợp tác thành công');
    }

    async findOne(requestId: number) {
        const request = await this.repo.findOne({
            where: { requestId },
            relations: ['requester', 'venue', 'sportCategory'],
        });
        return success(request, 'Lấy chi tiết yêu cầu hợp tác thành công');
    }

    async update(requestId: number, updateDto: UpdatePartnerRequestDto) {
        const result = await this.repo.update(requestId, updateDto);
        return success(result, 'Cập nhật yêu cầu hợp tác thành công');
    }

    async remove(requestId: number) {
        const result = await this.repo.delete(requestId);
        return success(result, 'Xóa yêu cầu hợp tác thành công');
    }
}
