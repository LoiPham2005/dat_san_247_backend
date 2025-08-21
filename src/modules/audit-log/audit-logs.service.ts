import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = new AuditLog();

    // Nếu có userId thì tìm user
    if (createAuditLogDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: createAuditLogDto.userId },
      });
      if (user) {
        auditLog.user = user;
      }
    }

    auditLog.action = createAuditLogDto.action;
    auditLog.tableName = createAuditLogDto.tableName ?? null;
    auditLog.recordId = createAuditLogDto.recordId ?? null;
    auditLog.oldValues = createAuditLogDto.oldValues ?? null;
    auditLog.newValues = createAuditLogDto.newValues ?? null;
    auditLog.ipAddress = createAuditLogDto.ipAddress ?? null;
    auditLog.userAgent = createAuditLogDto.userAgent ?? null;
    auditLog.sessionId = createAuditLogDto.sessionId ?? null;

    return this.auditLogRepository.save(auditLog);
  }

  async findAll(): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<AuditLog> {
    const auditLog = await this.auditLogRepository.findOne({
      where: { logId: id },
      relations: ['user'],
    });

    if (!auditLog) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }

    return auditLog;
  }

  async delete(id: number): Promise<void> {
    const result = await this.auditLogRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }
  }
}
