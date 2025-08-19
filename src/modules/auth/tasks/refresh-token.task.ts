// Tạo file mới: src/auth/tasks/refresh-token.task.ts
// xử lý ngầm như tự động xoá token.
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokenTasks {
    constructor(
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanupExpiredTokens() {
        await this.refreshTokenRepository.delete({
            expiresAt: LessThan(new Date()),
            isRevoked: false
        });
    }
}