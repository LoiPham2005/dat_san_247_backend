import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) {}

    async getAllSettings() {
        return this.prisma.settings.findMany({
            orderBy: { group_name: 'asc' }
        });
    }

    async getSettingByKey(key: string) {
        const setting = await this.prisma.settings.findUnique({
            where: { key }
        });
        if (!setting) throw new NotFoundException('Không tìm thấy thiết lập');
        return setting;
    }

    async updateSetting(id: string, value: string) {
        const setting = await this.prisma.settings.findUnique({ where: { id } });
        if (!setting) throw new NotFoundException('Không tìm thấy thiết lập');

        return this.prisma.settings.update({
            where: { id },
            data: { value }
        });
    }

    async updateSettingByKey(key: string, value: string) {
        const setting = await this.prisma.settings.findUnique({ where: { key } });
        if (!setting) throw new NotFoundException('Không tìm thấy thiết lập');

        return this.prisma.settings.update({
            where: { key },
            data: { value }
        });
    }
}
