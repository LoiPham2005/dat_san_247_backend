import { registerAs } from '@nestjs/config';

export default registerAs('zalopay', () => ({
    appId: process.env.ZALOPAY_APP_ID || '2553',
    key1: process.env.ZALOPAY_KEY1 || 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
    key2: process.env.ZALOPAY_KEY2 || 'kLtgPl8HHhfvMuDHPwKfgfsY4Yd2uiZn',
    apiEndpoint: process.env.ZALOPAY_API_ENDPOINT || 'https://sb-openapi.zalopay.vn/v2/create',
    redirectUrl: process.env.ZALOPAY_REDIRECT_URL || 'datsan247://payment-return?method=zalopay',
    callbackUrl: process.env.ZALOPAY_CALLBACK_URL || 'http://localhost:3001/api/v1/payments/webhook/zalopay',
}));
