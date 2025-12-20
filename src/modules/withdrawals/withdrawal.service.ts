import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { WithdrawalRequest, WithdrawalStatus } from './entities/withdrawal-request.entity';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { UpdateWithdrawalDto } from './dto/update-withdrawal.dto';
import { WithdrawalFilterDto } from './dto/withdrawal-filter.dto';
import { VenueOwner } from '../venue-owners/entities/venue-owner.entity';
import { CommissionRecord, CommissionStatus } from '../commissions/entities/commission-record.entity';
import { SettingsService } from '../settings/settings.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class WithdrawalsService {
  private readonly logger = new Logger(WithdrawalsService.name);

  constructor(
    @InjectRepository(WithdrawalRequest)
    private withdrawalRepository: Repository<WithdrawalRequest>,
    @InjectRepository(VenueOwner)
    private venueOwnerRepository: Repository<VenueOwner>,
    @InjectRepository(CommissionRecord)
    private commissionRepository: Repository<CommissionRecord>,
    private settingsService: SettingsService,
    @InjectQueue('withdrawals')
    private withdrawalQueue: Queue,
  ) { }

  // =====================================================
  // CREATE - Tạo yêu cầu rút tiền
  // =====================================================
  async create(ownerId: string, dto: CreateWithdrawalDto): Promise<WithdrawalRequest> {
    this.logger.log(`Creating withdrawal request for owner ${ownerId}`);

    // Kiểm tra owner tồn tại
    const owner = await this.venueOwnerRepository.findOne({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new NotFoundException('Venue owner not found');
    }

    // Kiểm tra số dư khả dụng
    const availableBalance = await this.getAvailableBalance(ownerId);

    if (dto.amount > availableBalance) {
      throw new BadRequestException(
        `Insufficient balance. Available: ${availableBalance}`
      );
    }

    // Kiểm tra yêu cầu rút tiền đang chờ xử lý
    const pendingRequest = await this.withdrawalRepository.findOne({
      where: {
        ownerId,
        status: In([WithdrawalStatus.PENDING, WithdrawalStatus.PROCESSING]),
      },
    });

    if (pendingRequest) {
      throw new ConflictException('You have a pending withdrawal request');
    }

    // Tạo mã yêu cầu
    const requestCode = await this.generateRequestCode();

    const withdrawal = this.withdrawalRepository.create({
      requestCode,
      ownerId,
      amount: Number(dto.amount),
      bankAccount: dto.bankAccount,
      bankName: dto.bankName,
      accountHolder: dto.accountHolder,
      notes: dto.notes,
      status: WithdrawalStatus.PENDING,
    });

    const savedWithdrawal = await this.withdrawalRepository.save(withdrawal);

    // Queue để gửi thông báo
    await this.withdrawalQueue.add('send-notification', {
      withdrawalId: savedWithdrawal.id,
    });

    return savedWithdrawal;
  }

  // =====================================================
  // READ - Lấy tất cả yêu cầu rút tiền
  // =====================================================
  async findAll(filters?: WithdrawalFilterDto): Promise<WithdrawalRequest[]> {
    const query = this.withdrawalRepository
      .createQueryBuilder('withdrawal')
      .leftJoinAndSelect('withdrawal.owner', 'owner')
      .leftJoinAndSelect('owner.user', 'ownerUser')
      .leftJoinAndSelect('withdrawal.processor', 'processor')
      .leftJoinAndSelect('processor.user', 'processorUser')
      .orderBy('withdrawal.createdAt', 'DESC');

    if (filters?.ownerId) {
      query.andWhere('withdrawal.ownerId = :ownerId', {
        ownerId: filters.ownerId,
      });
    }

    if (filters?.status) {
      query.andWhere('withdrawal.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.fromDate && filters?.toDate) {
      query.andWhere('withdrawal.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(filters.fromDate),
        toDate: new Date(filters.toDate),
      });
    }

    if (filters?.searchQuery) {
      query.andWhere(
        '(withdrawal.requestCode ILIKE :search OR ownerUser.fullName ILIKE :search OR withdrawal.bankAccount ILIKE :search)',
        { search: `%${filters.searchQuery}%` }
      );
    }

    return query.getMany();
  }

  // =====================================================
  // READ - Lấy yêu cầu rút tiền theo ID
  // =====================================================
  async findOne(id: string): Promise<WithdrawalRequest> {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id },
      relations: ['owner', 'owner.user', 'processor', 'processor.user'],
    });

    if (!withdrawal) {
      throw new NotFoundException(`Withdrawal request with ID ${id} not found`);
    }

    return withdrawal;
  }

  // =====================================================
  // READ - Lấy yêu cầu rút tiền của owner
  // =====================================================
  async getOwnerWithdrawals(ownerId: string, filters?: WithdrawalFilterDto): Promise<WithdrawalRequest[]> {
    const query = this.withdrawalRepository
      .createQueryBuilder('withdrawal')
      .where('withdrawal.ownerId = :ownerId', { ownerId })
      .leftJoinAndSelect('withdrawal.processor', 'processor')
      .leftJoinAndSelect('processor.user', 'processorUser')
      .orderBy('withdrawal.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('withdrawal.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.fromDate && filters?.toDate) {
      query.andWhere('withdrawal.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(filters.fromDate),
        toDate: new Date(filters.toDate),
      });
    }

    return query.getMany();
  }

  // =====================================================
  // READ - Lấy yêu cầu rút tiền chưa xử lý
  // =====================================================
  async getPendingWithdrawals(): Promise<WithdrawalRequest[]> {
    return this.withdrawalRepository.find({
      where: { status: In([WithdrawalStatus.PENDING, WithdrawalStatus.PROCESSING]) },
      relations: ['owner', 'owner.user', 'processor', 'processor.user'],
      order: { createdAt: 'ASC' },
    });
  }

  // =====================================================
  // READ - Lấy số dư khả dụng
  // =====================================================
  async getAvailableBalance(ownerId: string): Promise<number> {
    const result = await this.commissionRepository
      .createQueryBuilder('commission')
      .select('SUM(commission.owner_receives)', 'total')
      .where('commission.owner_id = :ownerId', { ownerId })
      .andWhere('commission.status = :status', {
        status: CommissionStatus.PAID,
      })
      .getRawOne();

    const paidTotal = parseFloat(result?.total || 0);

    // Trừ đi các lần rút tiền đã hoàn tất
    const withdrawnResult = await this.withdrawalRepository
      .createQueryBuilder('withdrawal')
      .select('SUM(withdrawal.amount)', 'total')
      .where('withdrawal.owner_id = :ownerId', { ownerId })
      .andWhere('withdrawal.status = :status', {
        status: WithdrawalStatus.COMPLETED,
      })
      .getRawOne();

    const withdrawn = parseFloat(withdrawnResult?.total || 0);

    return Number((paidTotal - withdrawn).toFixed(2));
  }

  // =====================================================
  // READ - Lấy chi tiết tài khoản ngân hàng
  // =====================================================
  async getBankDetails(id: string): Promise<any> {
    const withdrawal = await this.findOne(id);
    return {
      bankName: withdrawal.bankName,
      bankAccount: withdrawal.bankAccount,
      accountHolder: withdrawal.accountHolder,
    };
  }

  // =====================================================
  // UPDATE - Cập nhật yêu cầu rút tiền
  // =====================================================
  async update(id: string, dto: UpdateWithdrawalDto): Promise<WithdrawalRequest> {
    const withdrawal = await this.findOne(id);

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException(
        'Can only update pending withdrawal requests'
      );
    }

    Object.assign(withdrawal, dto);
    return this.withdrawalRepository.save(withdrawal);
  }

  // =====================================================
  // UPDATE - Duyệt yêu cầu rút tiền
  // =====================================================
  async approve(id: string, processedBy: string): Promise<WithdrawalRequest> {
    const withdrawal = await this.findOne(id);

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException('Withdrawal must be pending to approve');
    }

    withdrawal.status = WithdrawalStatus.APPROVED;
    withdrawal.processedBy = processedBy;
    withdrawal.processedAt = new Date();

    const saved = await this.withdrawalRepository.save(withdrawal);

    // Queue để xử lý chuyển tiền
    await this.withdrawalQueue.add('process-transfer', {
      withdrawalId: saved.id,
    });

    return saved;
  }

  // =====================================================
  // UPDATE - Duyệt nhiều yêu cầu
  // =====================================================
  async approveBulk(ids: string[], processedBy: string): Promise<void> {
    for (const id of ids) {
      await this.approve(id, processedBy);
    }
  }

  // =====================================================
  // UPDATE - Bắt đầu xử lý
  // =====================================================
  async startProcessing(id: string, processedBy: string): Promise<WithdrawalRequest> {
    const withdrawal = await this.findOne(id);

    if (withdrawal.status !== WithdrawalStatus.APPROVED) {
      throw new BadRequestException(
        'Withdrawal must be approved to start processing'
      );
    }

    withdrawal.status = WithdrawalStatus.PROCESSING;
    withdrawal.processedBy = processedBy;
    withdrawal.processedAt = new Date();

    return this.withdrawalRepository.save(withdrawal);
  }

  // =====================================================
  // UPDATE - Hoàn tất rút tiền
  // =====================================================
  async complete(id: string, transferReference: string): Promise<WithdrawalRequest> {
    const withdrawal = await this.findOne(id);

    if (withdrawal.status !== WithdrawalStatus.PROCESSING) {
      throw new BadRequestException(
        'Withdrawal must be processing to complete'
      );
    }

    withdrawal.status = WithdrawalStatus.COMPLETED;
    withdrawal.transferReference = transferReference;

    return this.withdrawalRepository.save(withdrawal);
  }

  // =====================================================
  // UPDATE - Từ chối yêu cầu rút tiền
  // =====================================================
  async reject(
    id: string,
    rejectionReason: string,
    processedBy: string
  ): Promise<WithdrawalRequest> {
    const withdrawal = await this.findOne(id);

    if (
      withdrawal.status !== WithdrawalStatus.PENDING &&
      withdrawal.status !== WithdrawalStatus.PROCESSING
    ) {
      throw new BadRequestException(
        'Can only reject pending or processing requests'
      );
    }

    withdrawal.status = WithdrawalStatus.REJECTED;
    withdrawal.rejectionReason = rejectionReason;
    withdrawal.processedBy = processedBy;
    withdrawal.processedAt = new Date();

    const saved = await this.withdrawalRepository.save(withdrawal);

    // Queue để gửi thông báo từ chối
    await this.withdrawalQueue.add('send-rejection-notification', {
      withdrawalId: saved.id,
    });

    return saved;
  }

  // =====================================================
  // UPDATE - Hủy yêu cầu rút tiền
  // =====================================================
  async cancel(id: string): Promise<WithdrawalRequest> {
    const withdrawal = await this.findOne(id);

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new BadRequestException('Can only cancel pending requests');
    }

    withdrawal.status = WithdrawalStatus.CANCELLED;
    return this.withdrawalRepository.save(withdrawal);
  }

  // =====================================================
  // DELETE - Xóa yêu cầu rút tiền
  // =====================================================
  async remove(id: string): Promise<void> {
    const withdrawal = await this.findOne(id);

    if (withdrawal.status !== WithdrawalStatus.REJECTED &&
      withdrawal.status !== WithdrawalStatus.CANCELLED) {
      throw new BadRequestException(
        'Can only delete rejected or cancelled requests'
      );
    }

    await this.withdrawalRepository.remove(withdrawal);
  }

  // =====================================================
  // STATISTICS - Thống kê rút tiền
  // =====================================================
  async getStatistics(filters?: WithdrawalFilterDto): Promise<any> {
    const query = this.withdrawalRepository.createQueryBuilder('withdrawal');

    if (filters?.ownerId) {
      query.where('withdrawal.ownerId = :ownerId', {
        ownerId: filters.ownerId,
      });
    }

    if (filters?.fromDate && filters?.toDate) {
      query.andWhere('withdrawal.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(filters.fromDate),
        toDate: new Date(filters.toDate),
      });
    }

    const total = await query.getCount();
    const totalAmount = await query
      .select('SUM(withdrawal.amount)', 'total')
      .getRawOne();

    // By status
    const byStatus = await this.withdrawalRepository
      .createQueryBuilder('withdrawal')
      .select('withdrawal.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(withdrawal.amount)', 'total')
      .groupBy('withdrawal.status')
      .getRawMany();

    // By owner
    const byOwner = await this.withdrawalRepository
      .createQueryBuilder('withdrawal')
      .leftJoinAndSelect('withdrawal.owner', 'owner')
      .leftJoinAndSelect('owner.user', 'user')
      .select('owner.id', 'ownerId')
      .addSelect('user.fullName', 'ownerName')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(withdrawal.amount)', 'total')
      .groupBy('owner.id')
      .addGroupBy('user.fullName')
      .orderBy('total', 'DESC')
      .limit(10)
      .getRawMany();

    // Monthly statistics
    const monthStats = await this.withdrawalRepository
      .createQueryBuilder('withdrawal')
      .select("DATE_TRUNC('month', withdrawal.created_at)", 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(withdrawal.amount)', 'total')
      .where('withdrawal.status = :status', {
        status: WithdrawalStatus.COMPLETED,
      })
      .groupBy("DATE_TRUNC('month', withdrawal.created_at)")
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
    const withdrawals = await this.withdrawalRepository.find({
      where: { ownerId },
    });

    const total = withdrawals.length;
    const pending = withdrawals.filter(
      (w) => w.status === WithdrawalStatus.PENDING
    ).length;
    const processing = withdrawals.filter(
      (w) => w.status === WithdrawalStatus.PROCESSING
    ).length;
    const approved = withdrawals.filter(
      (w) => w.status === WithdrawalStatus.APPROVED
    ).length;
    const completed = withdrawals.filter(
      (w) => w.status === WithdrawalStatus.COMPLETED
    ).length;
    const rejected = withdrawals.filter(
      (w) => w.status === WithdrawalStatus.REJECTED
    ).length;

    const totalAmount = withdrawals.reduce(
      (sum, w) => sum + Number(w.amount),
      0
    );
    const totalCompleted = withdrawals
      .filter((w) => w.status === WithdrawalStatus.COMPLETED)
      .reduce((sum, w) => sum + Number(w.amount), 0);

    return {
      total,
      pending,
      processing,
      approved,
      completed,
      rejected,
      totalAmount,
      totalCompleted,
      pendingAmount: withdrawals
        .filter((w) => w.status === WithdrawalStatus.PENDING)
        .reduce((sum, w) => sum + Number(w.amount), 0),
      averageAmount: total > 0 ? (totalAmount / total).toFixed(2) : 0,
    };
  }

  // =====================================================
  // EXPORT - Xuất yêu cầu rút tiền
  // =====================================================
  async exportWithdrawals(filters?: WithdrawalFilterDto): Promise<any[]> {
    const withdrawals = await this.findAll(filters);

    return withdrawals.map((w) => ({
      requestCode: w.requestCode,
      ownerName: w.owner?.user?.fullName,
      amount: Number(w.amount),
      bankName: w.bankName,
      bankAccount: w.bankAccount,
      accountHolder: w.accountHolder,
      status: w.status,
      processedBy: w.processor?.user?.fullName,
      processedAt: w.processedAt,
      transferReference: w.transferReference,
      rejectionReason: w.rejectionReason,
      createdAt: w.createdAt,
    }));
  }

  // =====================================================
  // HELPERS - Tạo mã yêu cầu
  // =====================================================
  private async generateRequestCode(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const code = `WD${timestamp}${random}`;

    const existing = await this.withdrawalRepository.findOne({
      where: { requestCode: code },
    });

    if (existing) {
      return this.generateRequestCode();
    }

    return code;
  }
}