import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SportTypesSeeder {
    private readonly logger = new Logger(SportTypesSeeder.name);

    constructor(private readonly prisma: PrismaService) { }

    async seed() {
        const sports = [
            { name: 'FOOTBALL', label: 'Bóng đá', icon: 'soccer' },
            { name: 'BADMINTON', label: 'Cầu lông', icon: 'badminton' },
            { name: 'TENNIS', label: 'Tennis', icon: 'tennis' },
            { name: 'BASKETBALL', label: 'Bóng rổ', icon: 'basketball' },
            { name: 'VOLLEYBALL', label: 'Bóng chuyền', icon: 'volleyball' },
            { name: 'PICKLEBALL', label: 'Pickleball', icon: 'pickleball' },
            { name: 'PINGPONG', label: 'Bóng bàn', icon: 'pingpong' },
        ];

        for (const sport of sports) {
            await this.prisma.sport_types.upsert({
                where: { name: sport.name },
                update: {},
                create: {
                    ...sport,
                    is_system: true,
                    is_active: true,
                },
            });
        }

        this.logger.log('Sport types seeded successfully');
    }
}
