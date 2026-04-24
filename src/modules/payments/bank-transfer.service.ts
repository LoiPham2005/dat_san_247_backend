import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export const BANK_TRANSFER_TIMEOUT_MINUTES = 15;
export const SEPAY_API_KEY = process.env.SEPAY_API_KEY || '';

@Injectable()
export class BankTransferService {
    private readonly logger = new Logger(BankTransferService.name);

    constructor(private prisma: PrismaService) {}

    // Lấy thông tin ngân hàng của chủ sân để hiển thị trên trang checkout
    async getVenueBankInfo(venueId: string) {
        const venue = await this.prisma.venues.findUnique({
            where: { id: venueId },
            select: { owner_id: true, name: true },
        });
        if (!venue) throw new NotFoundException('Không tìm thấy sân');

        const bankAccount = await this.prisma.payout_bank_accounts.findFirst({
            where: { wallets: { user_id: venue.owner_id } },
            orderBy: { is_default: 'desc' },
            select: {
                bank_name: true,
                bank_code: true,
                account_number: true,
                account_name: true,
                qr_code_url: true,
                is_default: true,
            },
        });

        return {
            venue_name: venue.name,
            bank_account: bankAccount ?? null,
            vietqr_base: bankAccount
                ? `https://img.vietqr.io/image/${encodeURIComponent(bankAccount.bank_code)}-${bankAccount.account_number}-compact2.png`
                : null,
        };
    }

    // Lấy thông tin QR + bank sau khi booking tạo (có booking_code trong content)
    async getBankTransferInfo(bookingCode: string, userId: string) {
        const booking = await this.prisma.bookings.findFirst({
            where: { booking_code: bookingCode, customer_id: userId },
            include: {
                venues: {
                    include: {
                        users: {
                            include: {
                                wallet: {
                                    include: {
                                        bank_accounts: { where: { is_default: true }, take: 1 },
                                    },
                                },
                            },
                        },
                    },
                },
                courts: true,
            },
        });

        if (!booking) throw new NotFoundException('Không tìm thấy booking');
        if (booking.payment_status === PaymentStatus.PAID) {
            return { already_paid: true, booking_code: bookingCode };
        }

        const ownerBankAccounts = booking.venues.users.wallet?.bank_accounts ?? [];
        let bankAccount: any = ownerBankAccounts[0];
        if (!bankAccount) {
            bankAccount = await this.prisma.payout_bank_accounts.findFirst({
                where: { wallets: { user_id: booking.venues.owner_id } },
                orderBy: { is_default: 'desc' },
            });
        }

        if (!bankAccount) throw new BadRequestException('Chủ sân chưa cài đặt tài khoản ngân hàng.');

        const amount = Number(booking.total_amount);
        const qrUrl = `https://img.vietqr.io/image/${encodeURIComponent(bankAccount.bank_code)}-${bankAccount.account_number}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(bookingCode)}&accountName=${encodeURIComponent(bankAccount.account_name)}`;

        const expiresAt = new Date(booking.created_at);
        expiresAt.setMinutes(expiresAt.getMinutes() + BANK_TRANSFER_TIMEOUT_MINUTES);

        return {
            already_paid: false,
            booking_code: bookingCode,
            amount,
            bank: {
                bank_name: bankAccount.bank_name,
                bank_code: bankAccount.bank_code,
                account_number: bankAccount.account_number,
                account_name: bankAccount.account_name,
            },
            transfer_content: bookingCode,
            qr_url: qrUrl,
            expires_at: expiresAt,
            venue_name: booking.venues.name,
            court_name: booking.courts.name,
            booking_date: booking.booking_date.toISOString().split('T')[0],
            start_time: booking.start_time.toISOString().substring(11, 16),
            end_time: booking.end_time.toISOString().substring(11, 16),
        };
    }

    async getPaymentStatus(bookingCode: string) {
        const booking = await this.prisma.bookings.findFirst({
            where: { booking_code: bookingCode },
            select: { payment_status: true, status: true },
        });
        if (!booking) throw new NotFoundException('Không tìm thấy booking');
        return {
            booking_code: bookingCode,
            payment_status: booking.payment_status,
            booking_status: booking.status,
            is_paid: booking.payment_status === PaymentStatus.PAID,
        };
    }

    // Xử lý webhook từ SePay
    async handleSepayWebhook(payload: {
        id: number;
        gateway: string;
        transactionDate: string;
        accountNumber: string;
        content: string;
        transferType: string;
        transferAmount: number;
        referenceCode?: string;
        description?: string;
        apiKey?: string;
    }) {
        // Chỉ xử lý giao dịch tiền vào
        if (payload.transferType !== 'in') {
            return { success: false, reason: 'not_incoming' };
        }

        // Tìm booking_code trong nội dung chuyển khoản (pattern: BK + 6-8 ký tự alphanumeric)
        const match = payload.content?.match(/BK[A-Z0-9]{4,10}/i);
        if (!match) {
            this.logger.warn(`SePay webhook: Không tìm thấy booking_code trong content: "${payload.content}"`);
            return { success: false, reason: 'no_booking_code' };
        }

        const bookingCode = match[0].toUpperCase();
        const booking = await this.prisma.bookings.findFirst({
            where: { booking_code: bookingCode },
        });

        if (!booking) {
            this.logger.warn(`SePay webhook: Không tìm thấy booking ${bookingCode}`);
            return { success: false, reason: 'booking_not_found' };
        }

        if (booking.payment_status === PaymentStatus.PAID) {
            return { success: true, reason: 'already_paid' };
        }

        const required = Number(booking.total_amount);
        if (payload.transferAmount < required) {
            this.logger.warn(`SePay webhook: Thiếu tiền booking ${bookingCode} — nhận ${payload.transferAmount}, cần ${required}`);
            return { success: false, reason: 'insufficient_amount', received: payload.transferAmount, required };
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.bookings.update({
                where: { id: booking.id },
                data: {
                    status: BookingStatus.CONFIRMED,
                    payment_status: PaymentStatus.PAID,
                    payment_method: PaymentMethod.BANK_TRANSFER,
                    paid_at: new Date(payload.transactionDate) || new Date(),
                },
            });
            await tx.payments.create({
                data: {
                    booking_id: booking.id,
                    amount: payload.transferAmount,
                    payment_method: PaymentMethod.BANK_TRANSFER,
                    status: PaymentStatus.PAID,
                    paid_at: new Date(payload.transactionDate) || new Date(),
                    gateway_txn_id: payload.referenceCode || String(payload.id),
                    gateway_response: JSON.stringify(payload),
                },
            });
        });

        this.logger.log(`SePay: Xác nhận booking ${bookingCode} — ${payload.transferAmount}đ từ ${payload.gateway}`);
        return { success: true, reason: 'confirmed', booking_code: bookingCode };
    }

    // Tự động cancel booking BANK_TRANSFER quá 15 phút chưa thanh toán
    async cancelExpiredBankTransferBookings() {
        const cutoff = new Date();
        cutoff.setMinutes(cutoff.getMinutes() - BANK_TRANSFER_TIMEOUT_MINUTES);

        const expired = await this.prisma.bookings.updateMany({
            where: {
                payment_method: PaymentMethod.BANK_TRANSFER,
                payment_status: PaymentStatus.PENDING,
                status: BookingStatus.PENDING,
                created_at: { lt: cutoff },
            },
            data: {
                status: BookingStatus.CANCELLED,
                cancelled_at: new Date(),
                cancellation_reason: 'Hết thời gian thanh toán chuyển khoản (15 phút)',
            },
        });

        if (expired.count > 0) {
            this.logger.log(`Auto-cancel: Đã hủy ${expired.count} booking hết hạn`);
        }
        return expired.count;
    }
}
