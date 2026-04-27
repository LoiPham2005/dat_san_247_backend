import { registerAs } from '@nestjs/config';

export default registerAs('vnpay', () => ({
    tmnCode: process.env.VNPAY_TMN_CODE || 'DEMOV210',
    hashSecret: process.env.VNPAY_HASH_SECRET || 'RAOEXHYVSDDIIENYWSLDIIZTANLQIUTY',
    paymentUrl: process.env.VNPAY_PAYMENT_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: process.env.VNPAY_RETURN_URL || 'datsan247://payment-return?method=vnpay',
    ipnUrl: process.env.VNPAY_IPN_URL || 'http://localhost:3001/api/v1/payments/webhook/vnpay',
}));
