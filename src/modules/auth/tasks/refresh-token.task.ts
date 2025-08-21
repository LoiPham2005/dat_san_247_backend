// Tạo file mới: src/auth/tasks/refresh-token.task.ts
// xử lý ngầm như tự động xoá token.
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from 'src/modules/refresh-tokens/entities/refresh-token.entity';
import { Repository, LessThan } from 'typeorm';

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