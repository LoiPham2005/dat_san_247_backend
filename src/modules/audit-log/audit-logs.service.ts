import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { User } from '../auth/entities/user.entity';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class AuditLogsService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createAuditLogDto: CreateAuditLogDto) {
        const auditLog = new AuditLog();

        if (createAuditLogDto.userId) {
            const user = await this.userRepository.findOne({
                where: { id: createAuditLogDto.userId },
            });
            if (user) {
                auditLog.user = user;
            }
        }

        Object.assign(auditLog, {
            action: createAuditLogDto.action,
            tableName: createAuditLogDto.tableName ?? null,
            recordId: createAuditLogDto.recordId ?? null,
            oldValues: createAuditLogDto.oldValues ?? null,
            newValues: createAuditLogDto.newValues ?? null,
            ipAddress: createAuditLogDto.ipAddress ?? null,
            userAgent: createAuditLogDto.userAgent ?? null,
            sessionId: createAuditLogDto.sessionId ?? null,
        });

        const saved = await this.auditLogRepository.save(auditLog);
        return success(saved, 'Tạo audit log thành công');
    }

    async findAll() {
        const logs = await this.auditLogRepository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
        return success(logs, 'Lấy danh sách audit log thành công');
    }

    async findOne(id: number) {
        const auditLog = await this.auditLogRepository.findOne({
            where: { logId: id },
            relations: ['user'],
        });

        if (!auditLog) {
            throw new NotFoundException(`Audit log với ID ${id} không tồn tại`);
        }

        return success(auditLog, 'Lấy thông tin audit log thành công');
    }

    async delete(id: number) {
        const result = await this.auditLogRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Audit log với ID ${id} không tồn tại`);
        }
        return success(null, 'Xóa audit log thành công');
    }
}
