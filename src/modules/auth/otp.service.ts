import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OtpType } from '@prisma/client';
import * as argon2 from 'argon2';
import { QueueService } from '../../shared/queue/queue.service';

@Injectable()
export class OtpService {
    constructor(
        private prisma: PrismaService,
        // private queueService: QueueService,
    ) { }

    async genCode(userId: string, type: OtpType) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const hash = await argon2.hash(code);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await this.prisma.otp_verifications.create({
            data: {
                user_id: userId,
                type,
                code_hash: hash,
                expires_at: expiresAt,
            },
        });

        return code;
    }

    async sendOTP(email: string, code: string, type: OtpType) {
        let template = 'welcome';
        let subject = 'Welcome to DatSan247';

        if (type === OtpType.EMAIL_VERIFY) {
            template = 'welcome';
            subject = 'Verify your email';
        } else if (type === OtpType.RESET_PASSWORD) {
            template = 'password_reset';
            subject = 'Password Reset Request';
        }

        console.log(`[OTP DEBUG] Code for ${email}: ${code}`);
        /*
        await this.queueService.addJob('mail', 'send-mail', {
            to: email,
            subject,
            template,
            context: { code, email },
        });
        */
    }

    async verifyCode(userId: string, code: string, type: OtpType) {
        const otpRecord = await this.prisma.otp_verifications.findFirst({
            where: {
                user_id: userId,
                type,
                is_used: false,
                expires_at: { gt: new Date() },
            },
            orderBy: { created_at: 'desc' },
        });

        if (!otpRecord) throw new BadRequestException('Invalid or expired OTP');

        const isMatch = await argon2.verify(otpRecord.code_hash, code);
        if (!isMatch) throw new BadRequestException('Invalid OTP code');

        await this.prisma.otp_verifications.update({
            where: { id: otpRecord.id },
            data: { is_used: true, used_at: new Date() },
        });

        return true;
    }
}
