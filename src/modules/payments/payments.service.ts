import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod, PaymentType } from './entities/payment.entity';
import { Booking, BookingStatus, PaymentStatus as BookingPaymentStatus } from '../bookings/entities/booking.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentFilterDto } from './dto/payment-filter.dto';
import { NotificationsService } from '../notifications/notifications.service';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private notificationsService: NotificationsService,
  ) { }

  // =====================================================
  // CREATE - Tạo thanh toán
  // =====================================================
  async create(dto: CreatePaymentDto): Promise<Payment> {
    const booking = await this.bookingRepository.findOne({
      where: { id: dto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const payment = this.paymentRepository.create({
      ...dto,
      transactionCode: this.generateTransactionCode(),
      status: PaymentStatus.PENDING,
    });

    return this.paymentRepository.save(payment);
  }

  // =====================================================
  // READ - Lấy tất cả thanh toán
  // =====================================================
  async findAll(filters?: PaymentFilterDto): Promise<Payment[]> {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking')
      .leftJoinAndSelect('payment.user', 'user')
      .orderBy('payment.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters?.paymentMethod) {
      query.andWhere('payment.paymentMethod = :method', {
        method: filters.paymentMethod,
      });
    }

    if (filters?.fromDate && filters?.toDate) {
      query.andWhere('payment.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(filters.fromDate),
        toDate: new Date(filters.toDate),
      });
    }

    return query.getMany();
  }

  // =====================================================
  // READ - Thanh toán theo ID
  // =====================================================
  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking', 'user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  // =====================================================
  // READ - Thanh toán theo booking
  // =====================================================
  async findByBooking(bookingId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { bookingId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // =====================================================
  // READ - Thanh toán theo user
  // =====================================================
  async findByUser(userId: string, filters?: PaymentFilterDto): Promise<Payment[]> {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.userId = :userId', { userId })
      .leftJoinAndSelect('payment.booking', 'booking')
      .orderBy('payment.createdAt', 'DESC');

    if (filters?.status) {
      query.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters?.paymentMethod) {
      query.andWhere('payment.paymentMethod = :method', {
        method: filters.paymentMethod,
      });
    }

    return query.getMany();
  }

  // =====================================================
  // READ - Lấy thanh toán theo mã giao dịch
  // =====================================================
  async findByTransactionCode(transactionCode: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionCode },
      relations: ['booking', 'user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  // =====================================================
  // UPDATE - Cập nhật thanh toán
  // =====================================================
  async update(id: string, dto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, dto);
    return this.paymentRepository.save(payment);
  }

  // =====================================================
  // DELETE - Xóa thanh toán
  // =====================================================
  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
  }

  // =====================================================
  // VNPAY - Tạo thanh toán VNPay
  // =====================================================
  async createVnpayPayment(
    bookingId: string,
    userId: string,
    returnUrl: string,
  ): Promise<any> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, userId },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const payment = this.paymentRepository.create({
      transactionCode: this.generateTransactionCode(),
      bookingId,
      userId,
      amount: booking.depositAmount,
      paymentMethod: PaymentMethod.VNPAY,
      paymentType: PaymentType.DEPOSIT,
      status: PaymentStatus.PENDING,
    });

    await this.paymentRepository.save(payment);

    const vnpayUrl = this.generateVnpayUrl(payment, booking, returnUrl);

    return {
      paymentId: payment.id,
      paymentUrl: vnpayUrl,
      amount: booking.depositAmount,
    };
  }

  // =====================================================
  // VNPAY - Xác thực callback VNPay
  // =====================================================
  async verifyVnpayCallback(vnpParams: any): Promise<Payment> {
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const sortedParams = this.sortObject(vnpParams);
    const signData = new URLSearchParams(sortedParams).toString();

    const vnpHashSecret = process.env.VNPAY_HASH_SECRET;
    if (!vnpHashSecret) {
      throw new BadRequestException('VNPAY_HASH_SECRET is not set');
    }
    const hmac = crypto.createHmac('sha512', vnpHashSecret as string);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash !== signed) {
      throw new BadRequestException('Invalid signature');
    }

    const transactionCode = vnpParams['vnp_TxnRef'];
    const payment = await this.paymentRepository.findOne({
      where: { transactionCode },
      relations: ['booking'],
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    // Cập nhật trạng thái thanh toán
    if (vnpParams['vnp_ResponseCode'] === '00') {
      payment.status = PaymentStatus.SUCCESS;
      payment.paidAt = new Date();
      payment.gatewayTransactionId = vnpParams['vnp_TransactionNo'];
      payment.gatewayResponse = vnpParams;

      // Cập nhật booking
      const booking = payment.booking;
      if (booking) {
        if (payment.paymentType === PaymentType.DEPOSIT) {
          booking.paymentStatus = BookingPaymentStatus.PARTIAL;
          booking.paymentMethod = PaymentMethod.VNPAY;
          await this.bookingRepository.save(booking);
        }
      }
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.gatewayResponse = vnpParams;
    }

    return this.paymentRepository.save(payment);
  }

  // =====================================================
  // MOMO - Tạo thanh toán MoMo
  // =====================================================
  async createMomoPayment(
    bookingId: string,
    userId: string,
    returnUrl: string,
  ): Promise<any> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, userId },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const payment = this.paymentRepository.create({
      transactionCode: this.generateTransactionCode(),
      bookingId,
      userId,
      amount: booking.depositAmount,
      paymentMethod: PaymentMethod.MOMO,
      paymentType: PaymentType.DEPOSIT,
      status: PaymentStatus.PENDING,
    });

    await this.paymentRepository.save(payment);

    const momoPaymentUrl = await this.requestMomoPayment(payment, booking, returnUrl);

    return {
      paymentId: payment.id,
      paymentUrl: momoPaymentUrl,
      amount: booking.depositAmount,
    };
  }

  // =====================================================
  // MOMO - Xác thực callback MoMo
  // =====================================================
  async verifyMomoCallback(momoResponse: any): Promise<Payment> {
    const orderId = momoResponse.orderId;
    const payment = await this.paymentRepository.findOne({
      where: { transactionCode: orderId },
      relations: ['booking'],
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (momoResponse.resultCode === 0) {
      payment.status = PaymentStatus.SUCCESS;
      payment.paidAt = new Date();
      payment.gatewayTransactionId = momoResponse.transId;
      payment.gatewayResponse = momoResponse;

      const booking = payment.booking;
      if (booking) {
        if (payment.paymentType === PaymentType.DEPOSIT) {
          booking.paymentStatus = BookingPaymentStatus.PARTIAL;
        } else if (payment.paymentType === PaymentType.FULL_PAYMENT) {
          booking.paymentStatus = BookingPaymentStatus.PAID;
        }
        booking.paymentMethod = PaymentMethod.MOMO;
        await this.bookingRepository.save(booking);
      }

      await this.notificationsService.sendPaymentNotification(payment.userId, {
        id: payment.id,
        amount: payment.amount,
        method: 'MoMo',
      });
    } else {
      payment.status = PaymentStatus.FAILED;
      payment.gatewayResponse = momoResponse;
    }

    return this.paymentRepository.save(payment);
  }

  // =====================================================
  // ZALOPAY - Tạo thanh toán ZaloPay
  // =====================================================
  async createZaloPayment(
    bookingId: string,
    userId: string,
    returnUrl: string,
  ): Promise<any> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, userId },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const payment = this.paymentRepository.create({
      transactionCode: this.generateTransactionCode(),
      bookingId,
      userId,
      amount: booking.depositAmount,
      paymentMethod: PaymentMethod.ZALOPAY,
      paymentType: PaymentType.DEPOSIT,
      status: PaymentStatus.PENDING,
    });

    await this.paymentRepository.save(payment);

    const zaloPaymentUrl = await this.requestZaloPayment(payment, booking, returnUrl);

    return {
      paymentId: payment.id,
      paymentUrl: zaloPaymentUrl,
      amount: booking.depositAmount,
    };
  }

  // =====================================================
  // BANK TRANSFER - Tạo yêu cầu chuyển khoản
  // =====================================================
  async createBankTransfer(
    bookingId: string,
    userId: string,
  ): Promise<Payment> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, userId },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const payment = this.paymentRepository.create({
      transactionCode: this.generateTransactionCode(),
      bookingId,
      userId,
      amount: booking.finalPrice,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentType: PaymentType.FULL_PAYMENT,
      status: PaymentStatus.PENDING,
      notes: `Chuyển khoản cho đặt sân ${booking.bookingCode}. Nội dung: ${booking.bookingCode}`,
    });

    return this.paymentRepository.save(payment);
  }

  // =====================================================
  // CASH - Tạo thanh toán tiền mặt
  // =====================================================
  async createCashPayment(
    bookingId: string,
    userId: string,
  ): Promise<Payment> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, userId },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const payment = this.paymentRepository.create({
      transactionCode: this.generateTransactionCode(),
      bookingId,
      userId,
      amount: booking.finalPrice,
      paymentMethod: PaymentMethod.CASH,
      paymentType: PaymentType.FULL_PAYMENT,
      status: PaymentStatus.PENDING,
      notes: 'Thanh toán tiền mặt tại địa điểm',
    });

    return this.paymentRepository.save(payment);
  }

  // =====================================================
  // CASH - Xác nhận thanh toán tiền mặt
  // =====================================================
  async confirmCashPayment(id: string): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.paymentMethod !== PaymentMethod.CASH) {
      throw new BadRequestException('This is not a cash payment');
    }

    payment.status = PaymentStatus.SUCCESS;
    payment.paidAt = new Date();

    const booking = await this.bookingRepository.findOne({
      where: { id: payment.bookingId },
    });

    if (booking) {
      booking.paymentStatus = BookingPaymentStatus.PAID;
      booking.paymentMethod = PaymentMethod.CASH;
      await this.bookingRepository.save(booking);
    }

    await this.notificationsService.sendPaymentNotification(payment.userId, {
      id: payment.id,
      amount: payment.amount,
      method: 'Tiền mặt',
    });

    return this.paymentRepository.save(payment);
  }

  // =====================================================
  // REFUND - Hoàn tiền
  // =====================================================
  async refundPayment(id: string, reason: string): Promise<Payment> {
    const payment = await this.findOne(id);

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('Can only refund successful payments');
    }

    payment.status = PaymentStatus.REFUNDED;
    payment.refundedAt = new Date();
    payment.notes = `Hoàn tiền - Lý do: ${reason}`;

    const booking = await this.bookingRepository.findOne({
      where: { id: payment.bookingId },
    });

    if (booking) {
      booking.paymentStatus = BookingPaymentStatus.REFUNDED;
      await this.bookingRepository.save(booking);
    }

    return this.paymentRepository.save(payment);
  }

  // =====================================================
  // STATISTICS - Thống kê thanh toán
  // =====================================================
  async getPaymentStatistics(filters?: PaymentFilterDto): Promise<any> {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.paymentMethod', 'method')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'total');

    if (filters?.fromDate && filters?.toDate) {
      query.where('payment.paidAt BETWEEN :fromDate AND :toDate', {
        fromDate: new Date(filters.fromDate),
        toDate: new Date(filters.toDate),
      });
    }

    query.groupBy('payment.paymentMethod');

    const stats = await query.getRawMany();
    const totalRevenue = stats.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);

    return {
      byMethod: stats.map((s) => ({
        method: s.method,
        count: parseInt(s.count),
        total: parseFloat(s.total || 0),
      })),
      totalRevenue,
      successCount: await this.paymentRepository.count({
        where: { status: PaymentStatus.SUCCESS },
      }),
      failedCount: await this.paymentRepository.count({
        where: { status: PaymentStatus.FAILED },
      }),
      pendingCount: await this.paymentRepository.count({
        where: { status: PaymentStatus.PENDING },
      }),
    };
  }

  // =====================================================
  // UTILITIES - Helper methods
  // =====================================================

  private generateTransactionCode(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN${timestamp}${random}`;
  }

  private generateVnpayUrl(payment: Payment, booking: Booking, returnUrl: string): string {
    const vnpUrl = process.env.VNPAY_URL;
    const vnpTmnCode = process.env.VNPAY_TMN_CODE;
    const vnpHashSecret = process.env.VNPAY_HASH_SECRET;

    const createDate = this.formatDate(new Date());
    const orderId = payment.transactionCode;
    const amount = Math.floor(payment.amount * 100);

    let vnpParams: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpTmnCode,
      vnp_Amount: amount,
      vnp_CreateDate: createDate,
      vnp_CurrCode: 'VND',
      vnp_IpAddr: '127.0.0.1',
      vnp_Locale: 'vn',
      vnp_OrderInfo: `Thanh toan dat san ${booking.bookingCode}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: returnUrl,
      vnp_TxnRef: orderId,
    };

    vnpParams = this.sortObject(vnpParams);

    const signData = new URLSearchParams(vnpParams).toString();
    const hmac = crypto.createHmac('sha512', vnpHashSecret as string);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnpParams['vnp_SecureHash'] = signed;

    const query = new URLSearchParams(vnpParams).toString();
    return `${vnpUrl}?${query}`;
  }

  private async requestMomoPayment(
    payment: Payment,
    booking: Booking,
    returnUrl: string,
  ): Promise<string> {
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const endpoint = process.env.MOMO_ENDPOINT;

    const orderId = payment.transactionCode;
    const requestId = orderId;
    const amount = Math.floor(payment.amount);
    const orderInfo = `Thanh toan dat san ${booking.bookingCode}`;
    const redirectUrl = returnUrl;
    const ipnUrl = `${process.env.API_URL}/payments/momo/callback`;
    const requestType = 'captureWallet';
    const extraData = '';

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac('sha256', secretKey as string)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType,
      extraData,
      signature,
      lang: 'vi',
    };

    try {
      const response = await axios.post(endpoint as string, requestBody);
      return response.data.payUrl;
    } catch (error) {
      this.logger.error(`MoMo payment request failed: ${error.message}`);
      throw new BadRequestException('Failed to create MoMo payment');
    }
  }

  private async requestZaloPayment(
    payment: Payment,
    booking: Booking,
    returnUrl: string,
  ): Promise<string> {
    // TODO: Implement ZaloPay integration
    return '';
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private sortObject(obj: any): any {
    const sorted: any = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
      sorted[key] = obj[key];
    });
    return sorted;
  }
}