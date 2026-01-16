import { registerAs } from '@nestjs/config';

// export default registerAs('app', () => ({
//     port: parseInt(process.env.PORT || '3000', 10),
//     env: process.env.NODE_ENV || 'development',
// }));

export default registerAs('app', () => ({
    port: parseInt(process.env.PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
}));
