import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AppVersionsService {
    constructor(private prisma: PrismaService) {}

    async getAllAppVersions() {
        return this.prisma.app_versions.findMany({
            orderBy: [
                { platform: 'asc' },
                { build_number: 'desc' }
            ]
        });
    }

    async createVersion(data: any) {
        return this.prisma.app_versions.create({
            data: {
                ...data,
                released_at: data.released_at ? new Date(data.released_at) : new Date()
            }
        });
    }

    async updateVersion(id: string, data: any) {
        const version = await this.prisma.app_versions.findUnique({ where: { id } });
        if (!version) throw new NotFoundException('Không tìm thấy phiên bản app');

        if (data.released_at) {
            data.released_at = new Date(data.released_at);
        }

        return this.prisma.app_versions.update({
            where: { id },
            data
        });
    }

    async deleteVersion(id: string) {
        const version = await this.prisma.app_versions.findUnique({ where: { id } });
        if (!version) throw new NotFoundException('Không tìm thấy phiên bản app');

        await this.prisma.app_versions.delete({ where: { id } });
        return id;
    }
}
