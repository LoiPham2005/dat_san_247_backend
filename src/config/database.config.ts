import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Load .env file
config();

// Create base configuration object
const dbOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    // Logging configuration
    logging: process.env.DB_LOGGING === 'true',

    // Entities location
    // Use dist paths for production/running app
    entities: ['dist/**/*.entity{.ts,.js}'],

    // Migrations location
    migrations: ['dist/database/migrations/*{.ts,.js}'],
    migrationsRun: false, // Don't auto-run migrations on startup for safety

    // SSL Configuration for production DBs (like Neon, Supabase, RDS)
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

    // Connection Pool settings
    extra: {
        max: parseInt(process.env.DB_POOL_MAX || '20', 10), // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    },

    // Synchronization - Enable in Development to auto-create tables
    synchronize: true, // Auto-create tables (dev only)

    // Drop schema on startup - Disable to persist data
    dropSchema: false
};

// Export configuration for NestJS ConfigModule
// Use TypeOrmModuleOptions to include NestJS specific options like autoLoadEntities
export default registerAs('database', (): TypeOrmModuleOptions => ({
    ...dbOptions,
    autoLoadEntities: true, // Automatically load entities registered with TypeOrmModule.forFeature
}));

// Export DataSource for running migrations via CLI
export const connectionSource = new DataSource(dbOptions);
