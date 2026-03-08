// ==========================================
// 📁 src/app.module.ts - TỐIƯU PRISMA
// ==========================================
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Load all configs
import * as configs from './config';

// Feature modules

// Shared services
import { StorageModule } from './shared/storage/storage.module';
import { MailModule } from './shared/mail/mail.module';
import { SmsModule } from './shared/sms/sms.module';
import { FcmModule } from './shared/fcm/fcm.module';
import { TurnstileModule } from './shared/cloudflare/turnstile.module';

import { AppController } from './app.controller';
import { WinstonModule } from 'nest-winston';
import { createWinstonFormat, createWinstonTransports } from './config/logger.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { LoggerModule } from './common/services/logger.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
    imports: [
        // 1. Config (Global)
        ConfigModule.forRoot({
            isGlobal: true,
            load: Object.values(configs),
            cache: true,
        }),

        // 2. Rate Limiting
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 100,
            },
        ]),


        // 3. Database
        // TypeOrmModule.forRootAsync({
        //     inject: [ConfigService],
        //     useFactory: (config: ConfigService) => {
        //         const dbConfig = config.get<TypeOrmModuleOptions>('database');
        //         if (!dbConfig) {
        //             throw new Error('Database configuration not found');
        //         }
        //         return dbConfig;
        //     },
        // }),

        // 3. Database (Prisma Only)
        PrismaModule,

        // 4. Feature Modules

        // 5. Shared Modules
        StorageModule,
        MailModule,
        SmsModule,
        // CacheModule,
        // QueueModule,
        FcmModule,
        LoggerModule,
        TurnstileModule,

        // 6. Logging (Winston)
        WinstonModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const loggerConfig = config.get('logger');
                return {
                    transports: createWinstonTransports(loggerConfig),
                    format: createWinstonFormat(),
                };
            },
        }),
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: HttpLoggingInterceptor,
        },
    ],
})
export class AppModule { }

