import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Holiday } from './entities/holiday.entity';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { HolidayFilterDto } from './dto/holiday-filter.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class HolidaysService {
  private readonly logger = new Logger(HolidaysService.name);

  constructor(
    @InjectRepository(Holiday)
    private holidayRepository: Repository<Holiday>,
  ) {}

  // =====================================================
  // CREATE - Tạo ngày lễ mới
  // =====================================================
  async create(dto: CreateHolidayDto): Promise<Holiday> {
    this.logger.log(`Creating holiday: ${dto.holidayName}`);

    // Kiểm tra ngày lễ đã tồn tại
    const existingHoliday = await this.holidayRepository.findOne({
      where: { holidayDate: new Date(dto.holidayDate) },
    });

    if (existingHoliday) {
      throw new ConflictException(
        `Holiday on ${dto.holidayDate} already exists`
      );
    }

    const holiday = this.holidayRepository.create({
      holidayDate: new Date(dto.holidayDate),
      holidayName: dto.holidayName,
      isRecurring: dto.isRecurring || false,
      priceMultiplier: dto.priceMultiplier || 1.5,
      isActive: dto.isActive !== false,
      description: dto.holidayName,
    });

    return this.holidayRepository.save(holiday);
  }

  // =====================================================
  // READ - Lấy tất cả ngày lễ
  // =====================================================
  async findAll(filters?: HolidayFilterDto): Promise<Holiday[]> {
    const query = this.holidayRepository
      .createQueryBuilder('holiday')
      .orderBy('holiday.holidayDate', 'ASC');

    if (filters?.holidayName) {
      query.andWhere('holiday.holidayName ILIKE :name', {
        name: `%${filters.holidayName}%`,
      });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('holiday.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters?.isRecurring !== undefined) {
      query.andWhere('holiday.isRecurring = :isRecurring', {
        isRecurring: filters.isRecurring,
      });
    }

    if (filters?.fromDate && filters?.toDate) {
      query.andWhere('holiday.holidayDate BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(filters.fromDate),
        toDate: new Date(filters.toDate),
      });
    }

    if (filters?.searchQuery) {
      query.andWhere('holiday.holidayName ILIKE :search', {
        search: `%${filters.searchQuery}%`,
      });
    }

    return query.getMany();
  }

  // =====================================================
  // READ - Lấy ngày lễ theo ID
  // =====================================================
  async findOne(id: string): Promise<Holiday> {
    const holiday = await this.holidayRepository.findOne({
      where: { id },
    });

    if (!holiday) {
      throw new NotFoundException(`Holiday with ID ${id} not found`);
    }

    return holiday;
  }

  // =====================================================
  // READ - Kiểm tra ngày có phải ngày lễ
  // =====================================================
  async isHoliday(date: Date): Promise<Holiday | null> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const holiday = await this.holidayRepository.findOne({
      where: {
        holidayDate: Between(startDate, endDate),
        isActive: true,
      },
    });

    return holiday || null;
  }

  // =====================================================
  // READ - Lấy các ngày lễ trong khoảng thời gian
  // =====================================================
  async getHolidaysBetween(fromDate: Date, toDate: Date): Promise<Holiday[]> {
    return this.holidayRepository.find({
      where: {
        holidayDate: Between(fromDate, toDate),
        isActive: true,
      },
      order: { holidayDate: 'ASC' },
    });
  }

  // =====================================================
  // READ - Lấy ngày lễ sắp tới
  // =====================================================
  async getUpcomingHolidays(days: number = 30): Promise<Holiday[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.holidayRepository.find({
      where: {
        holidayDate: Between(startDate, endDate),
        isActive: true,
      },
      order: { holidayDate: 'ASC' },
    });
  }

  // =====================================================
  // READ - Lấy ngày lễ trong năm
  // =====================================================
  async getHolidaysByYear(year: number): Promise<Holiday[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    return this.holidayRepository.find({
      where: {
        holidayDate: Between(startDate, endDate),
        isActive: true,
      },
      order: { holidayDate: 'ASC' },
    });
  }

  // =====================================================
  // READ - Lấy ngày lễ trong tháng
  // =====================================================
  async getHolidaysByMonth(year: number, month: number): Promise<Holiday[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.holidayRepository.find({
      where: {
        holidayDate: Between(startDate, endDate),
        isActive: true,
      },
      order: { holidayDate: 'ASC' },
    });
  }

  // =====================================================
  // READ - Lấy giá sân vào ngày lễ
  // =====================================================
  async getHolidayPriceMultiplier(date: Date): Promise<number> {
    const holiday = await this.isHoliday(date);
    return holiday ? Number(holiday.priceMultiplier) : 1;
  }

  // =====================================================
  // UPDATE - Cập nhật ngày lễ
  // =====================================================
  async update(id: string, dto: UpdateHolidayDto): Promise<Holiday> {
    const holiday = await this.findOne(id);

    // Nếu thay đổi ngày, kiểm tra xem ngày mới đã tồn tại chưa
    if (dto.holidayDate && dto.holidayDate !== holiday.holidayDate.toISOString().split('T')[0]) {
      const existing = await this.holidayRepository.findOne({
        where: { holidayDate: new Date(dto.holidayDate) },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Holiday on ${dto.holidayDate} already exists`
        );
      }
    }

    Object.assign(holiday, dto, {
      holidayDate: dto.holidayDate ? new Date(dto.holidayDate) : holiday.holidayDate,
    });

    return this.holidayRepository.save(holiday);
  }

  // =====================================================
  // UPDATE - Bật/Tắt ngày lễ
  // =====================================================
  async toggleActive(id: string): Promise<Holiday> {
    const holiday = await this.findOne(id);
    holiday.isActive = !holiday.isActive;
    return this.holidayRepository.save(holiday);
  }

  // =====================================================
  // UPDATE - Kích hoạt ngày lễ
  // =====================================================
  async activate(id: string): Promise<Holiday> {
    const holiday = await this.findOne(id);
    holiday.isActive = true;
    return this.holidayRepository.save(holiday);
  }

  // =====================================================
  // UPDATE - Vô hiệu hóa ngày lễ
  // =====================================================
  async deactivate(id: string): Promise<Holiday> {
    const holiday = await this.findOne(id);
    holiday.isActive = false;
    return this.holidayRepository.save(holiday);
  }

  // =====================================================
  // DELETE - Xóa ngày lễ
  // =====================================================
  async remove(id: string): Promise<void> {
    const holiday = await this.findOne(id);
    await this.holidayRepository.remove(holiday);
  }

  // =====================================================
  // DELETE - Xóa ngày lễ theo khoảng thời gian
  // =====================================================
  async removeByDateRange(fromDate: Date, toDate: Date): Promise<void> {
    await this.holidayRepository.delete({
      holidayDate: Between(fromDate, toDate),
    });
  }

  // =====================================================
  // BULK - Nhập ngày lễ hàng loạt
  // =====================================================
  async bulkCreate(holidays: CreateHolidayDto[]): Promise<Holiday[]> {
    const created: Holiday[] = [];

    for (const holidayDto of holidays) {
      try {
        const holiday = await this.create(holidayDto);
        created.push(holiday);
      } catch (error) {
        this.logger.warn(
          `Failed to create holiday ${holidayDto.holidayName}: ${error.message}`
        );
      }
    }

    return created;
  }

  // =====================================================
  // RECURRING - Tạo ngày lễ lặp lại hàng năm
  // =====================================================
  async createRecurringHoliday(
    dto: CreateHolidayDto,
    years: number = 5,
  ): Promise<Holiday[]> {
    if (!dto.isRecurring) {
      dto.isRecurring = true;
    }

    const created: Holiday[] = [];
    const baseDate = new Date(dto.holidayDate);
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < years; i++) {
      const newDate = new Date(baseDate);
      newDate.setFullYear(currentYear + i);

      try {
        const holiday = await this.create({
          ...dto,
          holidayDate: newDate.toISOString().split('T')[0],
        });
        created.push(holiday);
      } catch (error) {
        this.logger.warn(`Failed to create recurring holiday for year ${currentYear + i}`);
      }
    }

    return created;
  }

  // =====================================================
  // STATISTICS - Thống kê ngày lễ
  // =====================================================
  async getStatistics(): Promise<any> {
    const total = await this.holidayRepository.count();
    const active = await this.holidayRepository.count({
      where: { isActive: true },
    });
    const recurring = await this.holidayRepository.count({
      where: { isRecurring: true },
    });

    const currentYear = new Date().getFullYear();
    const thisYearHolidays = await this.getHolidaysByYear(currentYear);

    // Thống kê theo tháng
    const byMonth = await this.holidayRepository
      .createQueryBuilder('holiday')
      .select("EXTRACT(MONTH FROM holiday.holiday_date)", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('EXTRACT(YEAR FROM holiday.holiday_date) = :year', {
        year: currentYear,
      })
      .groupBy("EXTRACT(MONTH FROM holiday.holiday_date)")
      .orderBy('month', 'ASC')
      .getRawMany();

    // Thống kê giá sân tăng
    const priceMultipliers = await this.holidayRepository
      .createQueryBuilder('holiday')
      .select('holiday.priceMultiplier', 'multiplier')
      .addSelect('COUNT(*)', 'count')
      .where('holiday.isActive = :isActive', { isActive: true })
      .groupBy('holiday.priceMultiplier')
      .getRawMany();

    return {
      total,
      active,
      inactive: total - active,
      recurring,
      thisYearHolidays: thisYearHolidays.length,
      byMonth: byMonth.map((m) => ({
        month: parseInt(m.month),
        count: parseInt(m.count),
      })),
      priceMultipliers: priceMultipliers.map((p) => ({
        multiplier: parseFloat(p.multiplier),
        count: parseInt(p.count),
      })),
    };
  }

  // =====================================================
  // EXPORT - Xuất ngày lễ
  // =====================================================
  async exportHolidays(filters?: HolidayFilterDto): Promise<any[]> {
    const holidays = await this.findAll(filters);

    return holidays.map((h) => ({
      id: h.id,
      date: h.holidayDate.toISOString().split('T')[0],
      name: h.holidayName,
      isRecurring: h.isRecurring,
      priceMultiplier: Number(h.priceMultiplier),
      isActive: h.isActive,
      description: h.description,
      createdAt: h.createdAt,
    }));
  }

  // =====================================================
  // IMPORT - Nhập ngày lễ từ file
  // =====================================================
  async importHolidays(holidays: CreateHolidayDto[]): Promise<Holiday[]> {
    return this.bulkCreate(holidays);
  }

  // =====================================================
  // SCHEDULE - Tự động cập nhật ngày lễ lặp lại hàng năm
  // =====================================================
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async autoUpdateRecurringHolidays(): Promise<void> {
    this.logger.log('Auto-updating recurring holidays');

    try {
      const recurringHolidays = await this.holidayRepository.find({
        where: { isRecurring: true },
      });

      const nextYear = new Date().getFullYear() + 1;

      for (const holiday of recurringHolidays) {
        const newDate = new Date(holiday.holidayDate);
        newDate.setFullYear(nextYear);

        // Kiểm tra xem năm tới đã có holiday này chưa
        const existing = await this.holidayRepository.findOne({
          where: { holidayDate: newDate },
        });

        if (!existing) {
          await this.create({
            holidayDate: newDate.toISOString().split('T')[0],
            holidayName: holiday.holidayName,
            isRecurring: true,
            priceMultiplier: Number(holiday.priceMultiplier),
            isActive: holiday.isActive,
          });

          this.logger.log(`Created recurring holiday: ${holiday.holidayName} for ${nextYear}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to auto-update recurring holidays: ${error.message}`);
    }
  }

  // =====================================================
  // HELPER - Kiểm tra ngày lễ cuối tuần
  // =====================================================
  async isHolidayOrWeekend(date: Date): Promise<boolean> {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) return true;

    const holiday = await this.isHoliday(date);
    return !!holiday;
  }

  // =====================================================
  // HELPER - Tính số ngày lễ trong khoảng
  // =====================================================
  async countHolidaysInRange(fromDate: Date, toDate: Date): Promise<number> {
    return this.holidayRepository.count({
      where: {
        holidayDate: Between(fromDate, toDate),
        isActive: true,
      },
    });
  }

  // =====================================================
  // HELPER - Lấy danh sách tất cả ngày lễ lặp lại
  // =====================================================
  async getRecurringHolidayNames(): Promise<string[]> {
    const holidays = await this.holidayRepository.find({
      where: { isRecurring: true },
    });

    const names = new Set<string>();
    holidays.forEach((h) => names.add(h.holidayName));

    return Array.from(names);
  }
}