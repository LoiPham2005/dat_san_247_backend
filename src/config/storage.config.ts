import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
    driver: process.env.STORAGE_DRIVER || 'local', // local, r2, s3
    local: {
        path: process.env.STORAGE_LOCAL_PATH || './uploads',
    },
    r2: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        endpoint: process.env.R2_ENDPOINT,
        bucket: process.env.R2_BUCKET,
        publicUrl: process.env.R2_PUBLIC_URL,
    },
}));
