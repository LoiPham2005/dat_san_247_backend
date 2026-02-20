import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';


@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const settings = await this.prisma.settings.findMany();
        return settings.map(s => ({
            ...s,
            createdAt: s.created_at,
            updatedAt: s.updated_at,
        }));
    }

    async upsert(data: any) {
        const { key, value, description } = data;
        const setting = await this.prisma.settings.findFirst({ where: { key } });

        if (setting) {
            return this.prisma.settings.update({
                where: { id: setting.id },
                data: {
                    value,
                    description,
                    updated_at: new Date(),
                }
            });
        } else {
            return this.prisma.settings.create({
                data: {
                    key,
                    value,
                    description,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            });
        }
    }
}
