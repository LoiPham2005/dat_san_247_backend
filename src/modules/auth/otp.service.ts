import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OtpType } from '@prisma/client';
import * as argon2 from 'argon2';
import { MailService } from '../../shared/mail/mail.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OtpService {
    constructor(
        private prisma: PrismaService,
        // private queueService: QueueService,
         private mailService: MailService,
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
        
        try {
            const templatePath = path.join(process.cwd(), 'src/shared/mail/templates', `${template}.html`);
            const htmlContent = fs.readFileSync(templatePath, 'utf8');
            
            const html = this.mailService.renderTemplate(htmlContent, {
                otp: code,
                name: email,
            });

            await this.mailService.sendMail(email, subject, html);
            console.log(`[MAIL SUCCESS] OTP sent directly to ${email}`);
        } catch (error) {
            console.error(`[MAIL ERROR] Failed to send OTP to ${email}:`, error.message);
        }
    }

    async verifyCode(userId: string, code: string, type: OtpType, consume: boolean = true) {
        const otpRecords = await this.prisma.otp_verifications.findMany({
            where: {
                user_id: userId,
                type,
                is_used: false,
                expires_at: { gt: new Date() },
            },
            orderBy: { created_at: 'desc' },
        });

        if (otpRecords.length === 0) {
            console.warn(`[OTP VERIFY] No valid OTP records found for user ${userId} and type ${type}`);
            throw new BadRequestException('Invalid or expired OTP');
        }

        console.log(`[OTP VERIFY] Found ${otpRecords.length} valid OTP records for user ${userId}. Comparing hashes...`);

        let matchedRecord: any = null;
        for (const record of otpRecords) {
            const isMatch = await argon2.verify(record.code_hash, code);
            if (isMatch) {
                matchedRecord = record;
                break;
            }
        }

        if (!matchedRecord) {
            console.error(`[OTP VERIFY] Hash mismatch for user ${userId}. Entered code: ${code}`);
            throw new BadRequestException('Invalid OTP code');
        }

        console.log(`[OTP VERIFY] Successfully matched OTP record ID: ${matchedRecord.id}`);

        if (consume) {
            await this.prisma.otp_verifications.update({
                where: { id: matchedRecord.id },
                data: { is_used: true, used_at: new Date() },
            });
            console.log(`[OTP CONSUME] Record marked as used: ${matchedRecord.id}`);
        } else {
            console.log(`[OTP PEEK] Record verified but NOT consumed: ${matchedRecord.id}`);
        }

        return true;
    }
}
