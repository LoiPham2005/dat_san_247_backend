// modules/vouchers/vouchers.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Voucher, DiscountType, ApplicableTo } from './entities/voucher.entity';
import { VoucherUsage } from './entities/voucher-usage.entity';
import { CreateVoucherDto } from './dto/create-voucher.dto';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
    @InjectRepository(VoucherUsage)
    private voucherUsageRepository: Repository<VoucherUsage>,
  ) {}

  async create(userId: string, createVoucherDto: CreateVoucherDto): Promise<Voucher> {
    // Check if voucher code already exists
    const existing = await this.voucherRepository.findOne({
      where: { voucherCode: createVoucherDto.voucherCode },
    });

    if (existing) {
      throw new BadRequestException('Voucher code already exists');
    }

    const voucher = this.voucherRepository.create({
      ...createVoucherDto,
      createdBy: userId,
    });

    return this.voucherRepository.save(voucher);
  }

  async findAll(): Promise<Voucher[]> {
    return this.voucherRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAvailableVouchers(): Promise<Voucher[]> {
    const now = new Date();

    return this.voucherRepository
      .createQueryBuilder('voucher')
      .where('voucher.is_active = true')
      .andWhere('voucher.valid_from <= :now', { now })
      .andWhere('voucher.valid_to >= :now', { now })
      .andWhere(
        '(voucher.usage_limit IS NULL OR voucher.used_count < voucher.usage_limit)',
      )
      .orderBy('voucher.created_at', 'DESC')
      .getMany();
  }

  async validateVoucher(
    voucherCode: string,
    userId: string,
    orderAmount: number,
    venueId?: string,
    sportTypeId?: string,
  ): Promise<{ valid: boolean; voucher?: Voucher; message?: string }> {
    const voucher = await this.voucherRepository.findOne({
      where: { voucherCode, isActive: true },
    });

    if (!voucher) {
      return { valid: false, message: 'Voucher not found' };
    }

    const now = new Date();

    // Check validity period
    if (now < voucher.validFrom || now > voucher.validTo) {
      return { valid: false, message: 'Voucher is not valid at this time' };
    }

    // Check usage limit
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return { valid: false, message: 'Voucher usage limit reached' };
    }

    // Check usage per user
    const userUsageCount = await this.voucherUsageRepository.count({
      where: { voucherId: voucher.id, userId },
    });

    if (userUsageCount >= voucher.usagePerUser) {
      return {
        valid: false,
        message: 'You have already used this voucher the maximum number of times',
      };
    }

    // Check minimum order amount
    if (orderAmount < voucher.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount is ${voucher.minOrderAmount.toLocaleString('vi-VN')} VNĐ`,
      };
    }

    // Check applicable venues
    if (
      voucher.applicableTo === ApplicableTo.SPECIFIC_VENUES &&
      venueId &&
      !voucher.venueIds?.includes(venueId)
    ) {
      return { valid: false, message: 'Voucher not applicable to this venue' };
    }

    // Check applicable sports
    if (
      voucher.applicableTo === ApplicableTo.SPECIFIC_SPORTS &&
      sportTypeId &&
      !voucher.sportTypeIds?.includes(sportTypeId)
    ) {
      return { valid: false, message: 'Voucher not applicable to this sport' };
    }

    return { valid: true, voucher };
  }

  async calculateDiscount(voucher: Voucher, orderAmount: number): Promise<number> {
    let discount = 0;

    if (voucher.discountType === DiscountType.PERCENTAGE) {
      discount = (orderAmount * voucher.discountValue) / 100;

      if (voucher.maxDiscountAmount && discount > voucher.maxDiscountAmount) {
        discount = voucher.maxDiscountAmount;
      }
    } else {
      discount = voucher.discountValue;
    }

    return Math.min(discount, orderAmount);
  }

  async applyVoucher(
    voucherCode: string,
    userId: string,
    bookingId: string,
    orderAmount: number,
  ): Promise<number> {
    const validation = await this.validateVoucher(voucherCode, userId, orderAmount);

    if (!validation.valid || !validation.voucher) {
      throw new BadRequestException(validation.message || 'Invalid voucher');
    }

    const discount = await this.calculateDiscount(validation.voucher, orderAmount);

    // Record usage
    await this.voucherUsageRepository.save({
      voucherId: validation.voucher.id,
      userId,
      bookingId,
      discountAmount: discount,
    });

    // Update voucher used count
    validation.voucher.usedCount += 1;
    await this.voucherRepository.save(validation.voucher);

    return discount;
  }

  async getUserVoucherUsage(userId: string): Promise<VoucherUsage[]> {
    return this.voucherUsageRepository.find({
      where: { userId },
      relations: ['voucher', 'booking'],
      order: { usedAt: 'DESC' },
    });
  }

  async deactivateVoucher(voucherId: string): Promise<void> {
    await this.voucherRepository.update(voucherId, { isActive: false });
  }
}