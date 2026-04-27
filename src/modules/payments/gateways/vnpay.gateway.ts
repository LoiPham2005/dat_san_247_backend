import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VNPay, ProductCode, VnpLocale, dateFormat, HashAlgorithm } from 'vnpay';

export interface VNPayInitResult {
    payment_url: string;
    txn_ref: string;
}

export interface VNPayIpnResult {
    isValid: boolean;
    isSuccess: boolean;
    txnRef: string;
    amount: number;
    message: string;
}

@Injectable()
export class VNPayGateway {
    private readonly logger = new Logger(VNPayGateway.name);
    private readonly vnpay: VNPay;

    constructor(private readonly config: ConfigService) {
        this.vnpay = new VNPay({
            tmnCode: this.config.get<string>('vnpay.tmnCode') ?? '',
            secureSecret: this.config.get<string>('vnpay.hashSecret') ?? '',
            vnpayHost: 'https://sandbox.vnpayment.vn',
            testMode: true,
            hashAlgorithm: HashAlgorithm.SHA512,
        });
    }

    async createPaymentUrl(params: {
        bookingCode: string;
        amount: number;
        orderInfo: string;
        ipAddr: string;
    }): Promise<VNPayInitResult> {
        const txnRef = params.bookingCode;
        const returnUrl = this.config.get<string>('vnpay.returnUrl') ?? 'http://localhost:3000/checkout/vnpay-return';

        const paymentUrl = this.vnpay.buildPaymentUrl({
            vnp_Amount: params.amount,
            vnp_IpAddr: params.ipAddr,
            vnp_TxnRef: txnRef,
            vnp_OrderInfo: params.orderInfo,
            vnp_OrderType: ProductCode.Pay,
            vnp_ReturnUrl: returnUrl,
            vnp_Locale: VnpLocale.VN,
            vnp_CreateDate: dateFormat(new Date()),
            vnp_ExpireDate: dateFormat(new Date(Date.now() + 15 * 60 * 1000)), // 15 phút
        });

        this.logger.log(`VNPay URL created for booking ${txnRef}`);
        return { payment_url: paymentUrl, txn_ref: txnRef };
    }

    verifyIpn(query: Record<string, string>): VNPayIpnResult {
        try {
            const verify = this.vnpay.verifyIpnCall(query as any);

            return {
                isValid: verify.isVerified,
                isSuccess: verify.isVerified && query['vnp_ResponseCode'] === '00',
                txnRef: query['vnp_TxnRef'] || '',
                amount: verify.isVerified ? Number(query['vnp_Amount']) / 100 : 0,
                message: query['vnp_OrderInfo'] || '',
            };
        } catch (err) {
            this.logger.error('VNPay IPN verify error', err);
            return { isValid: false, isSuccess: false, txnRef: '', amount: 0, message: '' };
        }
    }

    verifyReturn(query: Record<string, string>): VNPayIpnResult {
        try {
            const verify = this.vnpay.verifyReturnUrl(query as any);

            return {
                isValid: verify.isVerified,
                isSuccess: verify.isVerified && query['vnp_ResponseCode'] === '00',
                txnRef: query['vnp_TxnRef'] || '',
                amount: verify.isVerified ? Number(query['vnp_Amount']) / 100 : 0,
                message: query['vnp_OrderInfo'] || '',
            };
        } catch (err) {
            this.logger.error('VNPay return verify error', err);
            return { isValid: false, isSuccess: false, txnRef: '', amount: 0, message: '' };
        }
    }
}
