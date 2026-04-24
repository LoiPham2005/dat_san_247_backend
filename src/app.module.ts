// ==========================================
// 📁 src/app.module.ts - TỐIƯU PRISMA
// ==========================================
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
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
import { QueueModule } from './shared/queue/queue.module';
import { TurnstileModule } from './shared/cloudflare/turnstile.module';

import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { VenuesModule } from './modules/venues/venues.module';
import { CourtsModule } from './modules/courts/courts.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SupportModule } from './modules/support/support.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { VenueStaffModule } from './modules/venue-staff/venue-staff.module';
import { SystemModule } from './modules/system/system.module';
import { LookupModule } from './modules/lookup/lookup.module';

import { WinstonModule } from 'nest-winston';
import { createWinstonFormat, createWinstonTransports } from './config/logger.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { LoggerModule } from './common/services/logger.module';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './shared/cache/cache.module';

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

        // 3. Database (Prisma Only)
        PrismaModule,

        ScheduleModule.forRoot(),

        // 4. Feature Modules
        AuthModule,
        UsersModule,
        RolesModule,
        VenuesModule,
        CourtsModule,
        BookingsModule,
        PaymentsModule,
        PromotionsModule,
        ReviewsModule,
        SupportModule,
        NotificationsModule,
        VenueStaffModule,
        SystemModule,
        LookupModule,

        // 5. Shared Modules
        StorageModule,
        MailModule,
        SmsModule,
        QueueModule,
        CacheModule,
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

