import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { CommissionRecord, CommissionStatus } from './entities/commission-record.entity';
import { CreateCommissionDto } from './dto/create-commission.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { CommissionFilterDto } from './dto/commission-filter.dto';
import { Booking } from '../bookings/entities/booking.entity';
import { VenueOwner } from '../venue-owners/entities/venue-owner.entity';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class CommissionsService {
  private readonly logger = new Logger(CommissionsService.name);

  constructor(
    @InjectRepository(CommissionRecord)
    private commissionRepository: Repository<CommissionRecord>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(VenueOwner)
    private venueOwnerRepository: Repository<VenueOwner>,
    private settingsService: SettingsService,
  ) { }

  // =====================================================
  // CREATE - Tạo hoa hồng mới
  // =====================================================
  async create(dto: CreateCommissionDto): Promise<CommissionRecord> {
    this.logger.log(`Creating commission for booking ${dto.bookingId}`);

    // Kiểm tra booking tồn tại
    const booking = await this.bookingRepository.findOne({
      where: { id: dto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Kiểm tra owner tồn tại
    const owner = await this.venueOwnerRepository.findOne({
      where: { id: dto.ownerId },
    });

    if (!owner) {
      throw new NotFoundException('Venue owner not found');
    }

    // Kiểm tra commission đã tồn tại cho booking này
    const existing = await this.commissionRepository.findOne({
      where: { bookingId: dto.bookingId },
    });

    if (existing) {
      throw new BadRequestException('Commission already exists for this booking');
    }

    // Tính toán commission
    const commissionAmount = (dto.bookingAmount * dto.commissionRate) / 100;
    const ownerReceives = dto.bookingAmount - commissionAmount;

    const commission = this.commissionRepository.create({
      ...dto,
      commissionAmount: Number(commissionAmount.toFixed(2)),
      ownerReceives: Number(ownerReceives.toFixed(2)),
      status: CommissionStatus.PENDING,
    });

    return this.commissionRepository.save(commission);
  }

  // =====================================================
  // CREATE - Tạo hoa hồng từ booking
  // =====================================================
  async createFromBooking(bookingId: string, commissionRate?: number): Promise<CommissionRecord> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['court', 'court.venue'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Lấy tỉ lệ hoa hồng từ settings nếu không được cung cấp
    const rate = commissionRate || (await this.getDefaultCommissionRate());

    return this.create({
      bookingId,
      ownerId: booking.court.venue.ownerId,
      bookingAmount: Number(booking.finalPrice),
      commissionRate: rate,
    });
  }

  // =====================================================
  // READ - Lấy tất cả hoa hồng
  // =====================================================
  async findAll(filters?: CommissionFilterDto): Promise<CommissionRecord[]> {
    const query = this.commissionRepository
      .createQueryBuilder('commission')
      .leftJoinAndSelect('commission.booking', 'booking')
      .leftJoinAndSelect('commission.owner', 'owner')
      .leftJoinAndSelect('owner.user', 'user')
      .orderBy('commission.createdAt', 'DESC');

    if (filters?.ownerId) {
      query.andWhere('commission.ownerId = :ownerId', {
        ownerId: filters.ownerId,
      });
    }

    if (filters?.bookingId) {
      query.andWhere('commission.bookingId = :bookingId', {
        bookingId: filters.bookingId,
      });
    }

    if (filters?.status) {
      query.andWhere('commission.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.fromDate && filters?.toDate) {
      query.andWhere('commission.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(filters.fromDate),
        toDate: new Date(filters.toDate),
      });
    }

    if (filters?.searchQuery) {
      query.andWhere(
        '(user.fullName ILIKE :search OR booking.bookingCode ILIKE :search)',
        { search: `%${filters.searchQuery}%` }
      );
    }

    return query.getMany();
  }

  // =====================================================
  // READ - Lấy hoa hồng theo ID
  // =====================================================
  async findOne(id: string): Promise<CommissionRecord> {
    const commission = await this.commissionRepository.findOne({
      where: { id },
      relations: ['booking', 'owner'],
    });

    if (!commission) {
      throw new NotFoundException(`Commission with ID ${id} not found`);
    }

    return commission;
  }

  // =====================================================
  // READ - Lấy hoa hồng của owner
  // =====================================================
  async getOwnerCommissions(
    ownerId: string,
    filters?: CommissionFilterDto,
  ): Promise<CommissionRecord[]> {
    const query = this.commissionRepository
      .createQueryBuilder('commission')
      .leftJoinAndSelect('commission.booking', 'booking')
      .where('commission.ownerId = :ownerId', { ownerId })
      .orderBy('commission.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('commission.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.fromDate && filters?.toDate) {
      query.andWhere('commission.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(filters.fromDate),
        toDate: new Date(filters.toDate),
      });
    }

    return query.getMany();
  }

  // =====================================================
  // READ - Lấy hoa hồng chưa được duyệt
  // =====================================================
  async getPendingCommissions(): Promise<CommissionRecord[]> {
    return this.commissionRepository.find({
      where: { status: CommissionStatus.PENDING },
      relations: ['booking', 'owner'],
      order: { createdAt: 'ASC' },
    });
  }

  // =====================================================
  // READ - Lấy hoa hồng chưa được thanh toán
  // =====================================================
  async getUnpaidCommissions(): Promise<CommissionRecord[]> {
    return this.commissionRepository.find({
      where: { status: In([CommissionStatus.APPROVED]) },
      relations: ['booking', 'owner'],
      order: { createdAt: 'ASC' },
    });
  }

  // =====================================================
  // UPDATE - Cập nhật hoa hồng
  // =====================================================
  async update(
    id: string,
    dto: UpdateCommissionDto,
  ): Promise<CommissionRecord> {
    const commission = await this.findOne(id);

    if (commission.status !== CommissionStatus.PENDING) {
      throw new BadRequestException(
        'Cannot update commission that is not pending'
      );
    }

    // Recalculate if amount or rate changed
    if (dto.bookingAmount || dto.commissionRate) {
      const bookingAmount = dto.bookingAmount || commission.bookingAmount;
      const commissionRate = dto.commissionRate || commission.commissionRate;
      const commissionAmount = (bookingAmount * commissionRate) / 100;
      const ownerReceives = bookingAmount - commissionAmount;

      Object.assign(commission, {
        ...dto,
        commissionAmount: Number(commissionAmount.toFixed(2)),
        ownerReceives: Number(ownerReceives.toFixed(2)),
      });
    } else {
      Object.assign(commission, dto);
    }

    return this.commissionRepository.save(commission);
  }

  // =====================================================
  // UPDATE - Duyệt hoa hồng
  // =====================================================
  async approve(id: string): Promise<CommissionRecord> {
    const commission = await this.findOne(id);

    if (commission.status !== CommissionStatus.PENDING) {
      throw new BadRequestException('Commission is not pending');
    }

    commission.status = CommissionStatus.APPROVED;
    return this.commissionRepository.save(commission);
  }

  // =====================================================
  // UPDATE - Duyệt nhiều hoa hồng
  // =====================================================
  async approveBulk(ids: string[]): Promise<void> {
    await this.commissionRepository.update(
      { id: In(ids), status: CommissionStatus.PENDING },
      { status: CommissionStatus.APPROVED }
    );
  }

  // =====================================================
  // UPDATE - Thanh toán hoa hồng
  // =====================================================
  async pay(id: string): Promise<CommissionRecord> {
    const commission = await this.findOne(id);

    if (commission.status !== CommissionStatus.APPROVED) {
      throw new BadRequestException('Commission must be approved before payment');
    }

    commission.status = CommissionStatus.PAID;
    commission.paidAt = new Date();
    return this.commissionRepository.save(commission);
  }

  // =====================================================
  // UPDATE - Thanh toán nhiều hoa hồng
  // =====================================================
  async payBulk(ids: string[]): Promise<void> {
    await this.commissionRepository.update(
      { id: In(ids), status: CommissionStatus.APPROVED },
      { status: CommissionStatus.PAID, paidAt: new Date() }
    );
  }

  // =====================================================
  // UPDATE - Hủy hoa hồng
  // =====================================================
  async cancel(id: string, reason?: string): Promise<CommissionRecord> {
    const commission = await this.findOne(id);

    if (commission.status === CommissionStatus.PAID) {
      throw new BadRequestException('Cannot cancel paid commission');
    }

    commission.status = CommissionStatus.CANCELLED;
    commission.notes = reason || commission.notes;
    return this.commissionRepository.save(commission);
  }

  // =====================================================
  // DELETE - Xóa hoa hồng
  // =====================================================
  async remove(id: string): Promise<void> {
    const commission = await this.findOne(id);

    if (commission.status === CommissionStatus.PAID) {
      throw new BadRequestException('Cannot delete paid commission');
    }

    await this.commissionRepository.remove(commission);
  }

  // =====================================================
  // STATISTICS - Thống kê hoa hồng
  // =====================================================
  async getStatistics(filters?: CommissionFilterDto): Promise<any> {
    const query = this.commissionRepository.createQueryBuilder('commission');

    if (filters?.ownerId) {
      query.where('commission.ownerId = :ownerId', {
        ownerId: filters.ownerId,
      });
    }

    if (filters?.fromDate && filters?.toDate) {
      query.andWhere('commission.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(filters.fromDate),
        toDate: new Date(filters.toDate),
      });
    }

    const total = await query.getCount();
    const totalAmount = await query
      .select('SUM(commission.commissionAmount)', 'total')
      .getRawOne();

    // By status
    const byStatus = await this.commissionRepository
      .createQueryBuilder('commission')
      .select('commission.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(commission.commissionAmount)', 'total')
      .groupBy('commission.status')
      .getRawMany();

    // By owner
    const byOwner = await this.commissionRepository
      .createQueryBuilder('commission')
      .leftJoinAndSelect('commission.owner', 'owner')
      .select('owner.id', 'ownerId')
      .addSelect('owner.fullName', 'ownerName')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(commission.commissionAmount)', 'total')
      .groupBy('owner.id')
      .addGroupBy('owner.fullName')
      .orderBy('total', 'DESC')
      .limit(10)
      .getRawMany();

    // Month statistics
    const monthStats = await this.commissionRepository
      .createQueryBuilder('commission')
      .select("DATE_TRUNC('month', commission.createdAt)", 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(commission.commissionAmount)', 'total')
      .groupBy("DATE_TRUNC('month', commission.createdAt)")
      .orderBy('month', 'DESC')
      .limit(12)
      .getRawMany();

    return {
      total,
      totalAmount: parseFloat(totalAmount?.total || 0),
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: parseInt(s.count),
        total: parseFloat(s.total || 0),
      })),
      byOwner: byOwner.map((o) => ({
        ownerId: o.ownerId,
        ownerName: o.ownerName,
        count: parseInt(o.count),
        total: parseFloat(o.total || 0),
      })),
      monthStats: monthStats.map((m) => ({
        month: m.month,
        count: parseInt(m.count),
        total: parseFloat(m.total || 0),
      })),
    };
  }

  // =====================================================
  // STATISTICS - Thống kê owner
  // =====================================================
  async getOwnerStatistics(ownerId: string): Promise<any> {
    const commissions = await this.commissionRepository.find({
      where: { ownerId },
    });

    const total = commissions.length;
    const pending = commissions.filter(
      (c) => c.status === CommissionStatus.PENDING
    ).length;
    const approved = commissions.filter(
      (c) => c.status === CommissionStatus.APPROVED
    ).length;
    const paid = commissions.filter(
      (c) => c.status === CommissionStatus.PAID
    ).length;

    const totalCommission = commissions.reduce(
      (sum, c) => sum + Number(c.commissionAmount),
      0
    );
    const totalOwnerReceives = commissions.reduce(
      (sum, c) => sum + Number(c.ownerReceives),
      0
    );
    const totalPaid = commissions
      .filter((c) => c.status === CommissionStatus.PAID)
      .reduce((sum, c) => sum + Number(c.commissionAmount), 0);

    const unpaidAmount = totalCommission - totalPaid;

    return {
      total,
      pending,
      approved,
      paid,
      totalCommission,
      totalOwnerReceives,
      totalPaid,
      unpaidAmount,
      averageCommission:
        total > 0 ? (totalCommission / total).toFixed(2) : 0,
    };
  }

  // =====================================================
  // EXPORT - Xuất hoa hồng
  // =====================================================
  async exportCommissions(filters?: CommissionFilterDto): Promise<any[]> {
    const commissions = await this.findAll(filters);

    return commissions.map((c) => ({
      id: c.id,
      bookingCode: c.booking?.bookingCode,
      ownerName: c.owner?.user?.fullName,
      bookingAmount: Number(c.bookingAmount),
      commissionRate: Number(c.commissionRate),
      commissionAmount: Number(c.commissionAmount),
      ownerReceives: Number(c.ownerReceives),
      status: c.status,
      paidAt: c.paidAt,
      createdAt: c.createdAt,
    }));
  }

  // =====================================================
  // HELPERS - Lấy tỉ lệ hoa hồng mặc định
  // =====================================================
  private async getDefaultCommissionRate(): Promise<number> {
    try {
      const rate = await this.settingsService.getByKey('COMMISSION_PERCENT');
      return Number(rate) || 10;
    } catch {
      return 10; // Default 10%
    }
  }

  // =====================================================
  // HELPERS - Tính hoa hồng
  // =====================================================
  calculateCommission(
    bookingAmount: number,
    commissionRate: number
  ): { commission: number; ownerReceives: number } {
    const commission = (bookingAmount * commissionRate) / 100;
    const ownerReceives = bookingAmount - commission;

    return {
      commission: Number(commission.toFixed(2)),
      ownerReceives: Number(ownerReceives.toFixed(2)),
    };
  }
}