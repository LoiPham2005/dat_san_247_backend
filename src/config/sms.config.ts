import { registerAs } from '@nestjs/config';

export default registerAs('sms', () => ({
    provider: process.env.SMS_PROVIDER || 'mock', // mock, speedsms, twilio
    apiKey: process.env.SMS_API_KEY,
    apiSecret: process.env.SMS_API_SECRET,
    from: process.env.SMS_FROM,
}));
