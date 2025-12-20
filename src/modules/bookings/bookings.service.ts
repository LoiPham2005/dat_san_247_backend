import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Booking, BookingStatus, PaymentStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { Court, CourtStatus } from '../courts/entities/court.entity';
import { PricingRule } from '../courts/entities/pricing-rule.entity';
import { Venue } from '../venues/entities/venue.entity';
import { CancelBookingDto } from './dto/cancel-bBooking.dto';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
    @InjectRepository(PricingRule)
    private pricingRuleRepository: Repository<PricingRule>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
    @InjectQueue('bookings')
    private bookingQueue: Queue,
  ) {}

  // =====================================================
  // CREATE - Tạo đặt sân mới
  // =====================================================
  async create(userId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
    this.logger.log(`Creating booking for user ${userId}`);

    // 1. Kiểm tra sân bóng tồn tại
    const court = await this.courtRepository.findOne({
      where: { id: createBookingDto.courtId },
      relations: ['venue', 'sportType'],
    });

    if (!court) {
      throw new NotFoundException('Court not found');
    }

    // 2. Kiểm tra sân có hoạt động
    if (court.status !== CourtStatus.ACTIVE) {
      throw new BadRequestException(`Court is not active: ${court.status}`);
    }

    // 3. Kiểm tra khung giờ có sẵn
    const isAvailable = await this.checkAvailability(
      createBookingDto.courtId,
      createBookingDto.bookingDate,
      createBookingDto.startTime,
      createBookingDto.endTime,
    );

    if (!isAvailable) {
      throw new BadRequestException('Time slot not available');
    }

    // 4. Tính giá
    const pricing = await this.calculatePrice(
      createBookingDto.courtId,
      createBookingDto.bookingDate,
      createBookingDto.startTime,
      createBookingDto.endTime,
    );

    // 5. Áp dụng voucher nếu có
    let discountAmount = 0;
    if (createBookingDto.voucherCode) {
      discountAmount = await this.applyVoucher(
        createBookingDto.voucherCode,
        userId,
        pricing.totalPrice,
      );
    }

    // 6. Tạo mã đặt sân
    const bookingCode = await this.generateBookingCode();

    // 7. Tạo đặt sân
    const booking = this.bookingRepository.create({
      bookingCode,
      userId,
      courtId: createBookingDto.courtId,
      bookingDate: new Date(createBookingDto.bookingDate),
      startTime: createBookingDto.startTime,
      endTime: createBookingDto.endTime,
      durationMinutes: pricing.durationMinutes,
      pricePerHour: pricing.pricePerHour,
      totalPrice: pricing.totalPrice,
      discountAmount,
      finalPrice: pricing.totalPrice - discountAmount,
      depositAmount: (pricing.totalPrice - discountAmount) * 0.3, // 30% tiền cọc
      customerName: createBookingDto.customerName,
      customerPhone: createBookingDto.customerPhone,
      customerEmail: createBookingDto.customerEmail,
      notes: createBookingDto.notes,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // 8. Queue để gửi thông báo
    await this.bookingQueue.add('send-confirmation', {
      bookingId: savedBooking.id,
      userId,
    });

    this.logger.log(`Booking created: ${savedBooking.id}`);
    return savedBooking;
  }

  // =====================================================
  // READ - Lấy tất cả đặt sân của user
  // =====================================================
  async findAll(userId: string, filters?: BookingFilterDto): Promise<Booking[]> {
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.user_id = :userId', { userId })
      .leftJoinAndSelect('booking.court', 'court')
      .leftJoinAndSelect('court.venue', 'venue')
      .orderBy('booking.booking_date', 'DESC')
      .addOrderBy('booking.start_time', 'DESC');

    if (filters?.status) {
      query.andWhere('booking.status = :status', { status: filters.status });
    }

    if (filters?.fromDate && filters?.toDate) {
      query.andWhere('booking.booking_date BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(filters.fromDate),
        toDate: new Date(filters.toDate),
      });
    }

    if (filters?.courtId) {
      query.andWhere('booking.court_id = :courtId', { courtId: filters.courtId });
    }

    return query.getMany();
  }

  // =====================================================
  // READ - Lấy đặt sân theo ID
  // =====================================================
  async findOne(id: string, userId?: string): Promise<Booking> {
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.id = :id', { id })
      .leftJoinAndSelect('booking.court', 'court')
      .leftJoinAndSelect('court.venue', 'venue')
      .leftJoinAndSelect('booking.payments', 'payments')
      .leftJoinAndSelect('booking.user', 'user');

    const booking = await query.getOne();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Nếu có userId, kiểm tra quyền sở hữu
    if (userId && booking.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this booking');
    }

    return booking;
  }

  // =====================================================
  // READ - Lấy đặt sân theo mã
  // =====================================================
  async findByCode(bookingCode: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { bookingCode },
      relations: ['court', 'court.venue', 'user', 'payments'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  // =====================================================
  // READ - Lấy đặt sân của venue owner
  // =====================================================
  async findVenueBookings(venueId: string, filters?: BookingFilterDto): Promise<Booking[]> {
    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.court', 'court')
      .where('court.venue_id = :venueId', { venueId })
      .orderBy('booking.booking_date', 'DESC')
      .addOrderBy('booking.start_time', 'DESC');

    if (filters?.status) {
      query.andWhere('booking.status = :status', { status: filters.status });
    }

    if (filters?.fromDate && filters?.toDate) {
      query.andWhere('booking.booking_date BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(filters.fromDate),
        toDate: new Date(filters.toDate),
      });
    }

    return query.getMany();
  }

  // =====================================================
  // READ - Kiểm tra khung giờ có sẵn
  // =====================================================
  async checkAvailability(
    courtId: string,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    const conflictingBookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.court_id = :courtId', { courtId })
      .andWhere('booking.booking_date = :date', { date })
      .andWhere('booking.status NOT IN (:...statuses)', {
        statuses: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
      })
      .andWhere(
        '(booking.start_time < :endTime AND booking.end_time > :startTime)',
        { startTime, endTime },
      )
      .getCount();

    return conflictingBookings === 0;
  }

  // =====================================================
  // READ - Tính giá
  // =====================================================
  async calculatePrice(
    courtId: string,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<any> {
    // Tính thời lượng
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    if (durationMinutes <= 0) {
      throw new BadRequestException('End time must be after start time');
    }

    // Lấy quy tắc giá
    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay(); // 0 = Sunday, 6 = Saturday
    const isDayType = dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : 'weekday';

    const pricingRule = await this.pricingRuleRepository
      .createQueryBuilder('pricing')
      .leftJoinAndSelect('pricing.court', 'court')
      .where('pricing.court_id = :courtId', { courtId })
      .andWhere('pricing.day_type = :dayType', { dayType: isDayType })
      .andWhere('pricing.time_from <= :startTime', { startTime })
      .andWhere('pricing.time_to >= :endTime', { endTime })
      .andWhere('pricing.is_active = :isActive', { isActive: true })
      .getOne();

    if (!pricingRule) {
      throw new BadRequestException('No pricing rule found for this time slot');
    }

    // Kiểm tra thời lượng tối thiểu và tối đa
    if (durationMinutes < pricingRule.minBookingDuration) {
      throw new BadRequestException(
        `Minimum booking duration is ${pricingRule.minBookingDuration} minutes`
      );
    }

    if (durationMinutes > pricingRule.maxBookingDuration) {
      throw new BadRequestException(
        `Maximum booking duration is ${pricingRule.maxBookingDuration} minutes`
      );
    }

    const pricePerHour = pricingRule.pricePerHour;
    const totalPrice = (pricePerHour * durationMinutes) / 60;

    return {
      durationMinutes,
      pricePerHour: Number(pricePerHour),
      totalPrice: Number(totalPrice),
      dayType: isDayType,
    };
  }

  // =====================================================
  // READ - Lấy khung giờ trống
  // =====================================================
  async getAvailableSlots(
    courtId: string,
    date: string,
  ): Promise<any[]> {
    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .select(['booking.start_time', 'booking.end_time'])
      .where('booking.court_id = :courtId', { courtId })
      .andWhere('booking.booking_date = :date', { date })
      .andWhere('booking.status NOT IN (:...statuses)', {
        statuses: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
      })
      .orderBy('booking.start_time', 'ASC')
      .getMany();

    // Tạo danh sách các khung giờ trống
    const availableSlots: any[] = [];
    let currentTime = '06:00';
    const endTime = '23:00';

    for (const booking of bookings) {
      if (currentTime < booking.startTime) {
        availableSlots.push({
          startTime: currentTime,
          endTime: booking.startTime,
        });
      }
      currentTime = booking.endTime;
    }

    if (currentTime < endTime) {
      availableSlots.push({
        startTime: currentTime,
        endTime: endTime,
      });
    }

    return availableSlots;
  }

  // =====================================================
  // UPDATE - Cập nhật đặt sân
  // =====================================================
  async update(
    id: string,
    userId: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<Booking> {
    const booking = await this.findOne(id, userId);

    // Chỉ có thể cập nhật đặt sân ở trạng thái PENDING
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Can only update bookings in PENDING status');
    }

    Object.assign(booking, updateBookingDto);
    return this.bookingRepository.save(booking);
  }

  // =====================================================
  // UPDATE - Hủy đặt sân
  // =====================================================
  async cancel(
    id: string,
    userId: string,
    cancelDto: CancelBookingDto,
  ): Promise<Booking> {
    const booking = await this.findOne(id, userId);

    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Cannot cancel this booking');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancellationReason = cancelDto.reason;
    booking.cancelledAt = new Date();
    booking.cancelledBy = userId;

    const savedBooking = await this.bookingRepository.save(booking);

    // Queue để xử lý hoàn tiền
    await this.bookingQueue.add('process-refund', {
      bookingId: savedBooking.id,
      userId,
    });

    return savedBooking;
  }

  // =====================================================
  // UPDATE - Xác nhận đặt sân
  // =====================================================
  async confirmBooking(id: string, ownerId?: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['court', 'court.venue'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Kiểm tra quyền nếu có ownerId
    if (ownerId && booking.court.venue.ownerId !== ownerId) {
      throw new ForbiddenException('You do not have permission to confirm this booking');
    }

    booking.status = BookingStatus.CONFIRMED;
    return this.bookingRepository.save(booking);
  }

  // =====================================================
  // UPDATE - Check-in
  // =====================================================
  async checkIn(id: string, ownerId?: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['court', 'court.venue'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Booking is not confirmed');
    }

    booking.status = BookingStatus.PLAYING;
    booking.checkedInAt = new Date();
    return this.bookingRepository.save(booking);
  }

  // =====================================================
  // UPDATE - Check-out
  // =====================================================
  async checkOut(id: string, ownerId?: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['court', 'court.venue'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== BookingStatus.PLAYING) {
      throw new BadRequestException('Booking is not currently playing');
    }

    booking.status = BookingStatus.COMPLETED;
    booking.checkedOutAt = new Date();
    return this.bookingRepository.save(booking);
  }

  // =====================================================
  // UPDATE - Đánh giá
  // =====================================================
  async addRating(
    id: string,
    userId: string,
    rating: number,
    review?: string,
  ): Promise<Booking> {
    const booking = await this.findOne(id, userId);

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Can only rate completed bookings');
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    booking.rating = rating;
    booking.review = review;
    booking.reviewedAt = new Date();

    return this.bookingRepository.save(booking);
  }

  // =====================================================
  // UTILITIES - Helper functions
  // =====================================================

  private async generateBookingCode(): Promise<string> {
    const prefix = 'BK';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  private async applyVoucher(
    voucherCode: string,
    userId: string,
    totalPrice: number,
  ): Promise<number> {
    // TODO: Implement voucher logic
    return 0;
  }

  // =====================================================
  // STATISTICS
  // =====================================================

  async getBookingStatistics(userId: string): Promise<any> {
    const bookings = await this.bookingRepository.find({
      where: { userId },
    });

    const stats = {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === BookingStatus.PENDING).length,
      confirmed: bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length,
      completed: bookings.filter((b) => b.status === BookingStatus.COMPLETED).length,
      cancelled: bookings.filter((b) => b.status === BookingStatus.CANCELLED).length,
      totalSpent: bookings
        .filter((b) => b.status === BookingStatus.COMPLETED)
        .reduce((sum, b) => sum + Number(b.finalPrice), 0),
    };

    return stats;
  }

  async getVenueBookingStatistics(venueId: string): Promise<any> {
    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.court', 'court')
      .where('court.venue_id = :venueId', { venueId })
      .getMany();

    const stats = {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === BookingStatus.PENDING).length,
      confirmed: bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length,
      completed: bookings.filter((b) => b.status === BookingStatus.COMPLETED).length,
      cancelled: bookings.filter((b) => b.status === BookingStatus.CANCELLED).length,
      totalRevenue: bookings
        .filter((b) => b.status === BookingStatus.COMPLETED)
        .reduce((sum, b) => sum + Number(b.finalPrice), 0),
    };

    return stats;
  }
}