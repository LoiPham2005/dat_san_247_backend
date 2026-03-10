import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsSeeder {
    private readonly logger = new Logger(SettingsSeeder.name);

    constructor(private readonly prisma: PrismaService) { }

    async seed() {
        const settings = [
            {
                key: 'commission_rate',
                value: '10',
                data_type: 'NUMBER' as any,
                description: 'Default platform commission rate (%)',
                group_name: 'FINANCE',
            },
            {
                key: 'vat_rate',
                value: '8',
                data_type: 'NUMBER' as any,
                description: 'Default VAT rate (%)',
                group_name: 'FINANCE',
            },
            {
                key: 'min_payout_amount',
                value: '100000',
                data_type: 'NUMBER' as any,
                description: 'Minimum amount for payout request (VND)',
                group_name: 'FINANCE',
            },
            {
                key: 'otp_expiry_minutes',
                value: '5',
                data_type: 'NUMBER' as any,
                description: 'OTP expiration time in minutes',
                group_name: 'SECURITY',
            },
        ];

        for (const setting of settings) {
            await this.prisma.settings.upsert({
                where: { key: setting.key },
                update: {},
                create: setting,
            });
        }

        this.logger.log('System settings seeded successfully');
    }
}
