// ==========================================
// 📁 src/app.module.ts - TỐIƯU
// ==========================================
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Load all configs
import * as configs from './config';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VenuesModule } from './modules/venues/venues.module';
import { CourtsModule } from './modules/courts/courts.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { TimeSlotsModule } from './modules/time-slots/time-slots.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SupportModule } from './modules/support/support.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ContentModule } from './modules/content/content.module';
import { ChatModule } from './modules/chat/chat.module';
import { SocialModule } from './modules/social/social.module';
import { AIModule } from './modules/ai/ai.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';



// Shared services
import { StorageModule } from './shared/storage/storage.module';
import { MailModule } from './shared/mail/mail.module';
import { SmsModule } from './shared/sms/sms.module';
import { FcmModule } from './shared/fcm/fcm.module';

import { AppController } from './app.controller';
import { WinstonModule } from 'nest-winston';
import { createWinstonFormat, createWinstonTransports } from './config/logger.config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { AppLoggerService } from './common/services/app-logger.service';
import { LoggerModule } from './common/services/logger.module';

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
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const dbConfig = config.get<TypeOrmModuleOptions>('database');
                if (!dbConfig) {
                    throw new Error('Database configuration not found');
                }
                return dbConfig;
            },
        }),

        // 4. Feature Modules
        AuthModule,
        UsersModule,
        RolesModule,
        PermissionsModule,
        VenuesModule,
        CourtsModule,
        BookingsModule,
        TimeSlotsModule,
        PaymentsModule,
        ReviewsModule,
        PromotionsModule,
        NotificationsModule,
        AnalyticsModule,
        DashboardModule,
        UploadsModule,
        SupportModule,
        SettingsModule,
        ContentModule,
        ChatModule,
        SocialModule,
        AIModule,
        SubscriptionsModule,
        LoyaltyModule,


        // 5. Shared Modules
        StorageModule,
        MailModule,
        SmsModule,
        // CacheModule,
        // QueueModule,
        FcmModule,
        LoggerModule,

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
