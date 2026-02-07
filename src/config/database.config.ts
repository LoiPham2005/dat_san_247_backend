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

    // Connection Pool settings - OPTIMIZED FOR DEV
    extra: {
        max: parseInt(process.env.DB_POOL_MAX || '10', 10), // Reduced from 20 to 10 for faster local bootstrap
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000, // Increased slightly to avoid timeout on slow networks
    },

    // Synchronization - Enable in Development to auto-create tables
    // ⚠️ WARNING: 'true' slows down startup significantly on remote DBs due to schema diffing.
    // Set DB_SYNCHRONIZE=false in .env for fast startup when not changing entities.
    // synchronize: process.env.DB_SYNCHRONIZE === 'true', // Defaults to false if not set (safer + faster)
    synchronize: false,

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







// câu lệnh xóa tất cả bảng trong database
// DO $$
// DECLARE
//     r RECORD;
// BEGIN
//     FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
//         EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
//     END LOOP;
// END $$;
