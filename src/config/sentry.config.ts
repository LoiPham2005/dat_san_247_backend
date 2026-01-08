import { registerAs } from '@nestjs/config';

export default registerAs('sentry', () => ({
    dsn: process.env.SENTRY_DSN,
    env: process.env.NODE_ENV || 'development',
    debug: process.env.SENTRY_DEBUG === 'true',
}));
