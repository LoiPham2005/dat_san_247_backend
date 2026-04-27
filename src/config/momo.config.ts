import { registerAs } from '@nestjs/config';

export default registerAs('momo', () => ({
    partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
    accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
    secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    apiEndpoint: process.env.MOMO_API_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
    redirectUrl: process.env.MOMO_REDIRECT_URL || 'datsan247://payment-return?method=momo',
    ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:3001/api/v1/payments/webhook/momo',
}));
