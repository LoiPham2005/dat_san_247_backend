import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class HolidaysService {
    constructor(private prisma: PrismaService) {}

    async getAllHolidays() {
        return this.prisma.holiday_calendar.findMany({
            orderBy: { holiday_date: 'asc' }
        });
    }

    async createHoliday(data: any) {
        return this.prisma.holiday_calendar.create({
            data: {
                ...data,
                holiday_date: new Date(data.holiday_date)
            }
        });
    }

    async updateHoliday(id: string, data: any) {
        const holiday = await this.prisma.holiday_calendar.findUnique({ where: { id } });
        if (!holiday) throw new NotFoundException('Không tìm thấy ngày lễ');

        if (data.holiday_date) {
            data.holiday_date = new Date(data.holiday_date);
        }

        return this.prisma.holiday_calendar.update({
            where: { id },
            data
        });
    }

    async deleteHoliday(id: string) {
        const holiday = await this.prisma.holiday_calendar.findUnique({ where: { id } });
        if (!holiday) throw new NotFoundException('Không tìm thấy ngày lễ');

        await this.prisma.holiday_calendar.delete({ where: { id } });
        return id;
    }
}
