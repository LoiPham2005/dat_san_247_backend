import { registerAs } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

// const dbOptions = {
//     type: 'postgres' as const,
//     host: process.env.DB_HOST || 'localhost',
//     port: parseInt(process.env.DB_PORT || '5432', 10),
//     username: process.env.DB_USERNAME || 'postgres',
//     password: process.env.DB_PASSWORD || 'postgres',
//     database: process.env.DB_DATABASE || 'sports_venue_booking',
//     logging: process.env.DB_LOGGING === 'true',
//     entities: ['src/**/*.entity.ts'],
//     migrations: ['src/database/migrations/*.ts'],
// };

const dbOptions = {
    type: 'postgres' as const,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    logging: process.env.DB_LOGGING === 'true',
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/database/migrations/*{.ts,.js}'],
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

export default registerAs('database', () => dbOptions);
export const connectionSource = new DataSource(dbOptions);
