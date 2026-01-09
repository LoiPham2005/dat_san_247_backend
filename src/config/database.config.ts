import { registerAs } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const dbOptions = {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'sports_venue_booking',
    logging: process.env.DB_LOGGING === 'true',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/database/migrations/*.ts'],
};

export default registerAs('database', () => dbOptions);
export const connectionSource = new DataSource(dbOptions);
