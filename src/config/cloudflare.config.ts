import { registerAs } from '@nestjs/config';

export default registerAs('cloudflare', () => ({
    turnstile: {
        secretKey: process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
        siteKey: process.env.CLOUDFLARE_TURNSTILE_SITE_KEY,
    },
}));
