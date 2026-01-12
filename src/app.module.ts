// ==========================================
// 📁 src/app.module.ts - TỐI ƯU
// ==========================================
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Load all configs at once
import * as configs from './config';

// Feature modules (grouped by domain)
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

// Shared services
import { StorageModule } from './shared/storage/storage.module';
import { MailModule } from './shared/mail/mail.module';

import { AppController } from './app.controller';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SupportModule } from './modules/support/support.module';
import { SmsModule } from './shared/sms/sms.module';
import { SettingsModule } from './modules/settings/settings.module';
import { FcmModule } from './shared/fcm/fcm.module';
import { Permission } from './modules/permissions/entities/permission.entity';
import { Role } from './modules/roles/entities/role.entity';
import { User } from './modules/users/entities/user.entity';

@Module({
    imports: [
        // Config (global)
        ConfigModule.forRoot({
            isGlobal: true,
            load: Object.values(configs),
            cache: true,
        }),

        // Rate Limiting
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 100,
            },
        ]),

        // Database
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get('database.host'),
                port: config.get('database.port'),
                username: config.get('database.username'),
                password: config.get('database.password'),
                database: config.get('database.database'),
                autoLoadEntities: true,
                synchronize: config.get('app.env') === 'development',
                logging: config.get('database.logging'),
                ssl: config.get('app.env') === 'production' ? { rejectUnauthorized: false } : false,
                // dropSchema: true,
            }),
        }),

        // Feature modules
        // AuthModule,
        // UsersModule,
        // VenuesModule,
        // CourtsModule,
        // BookingsModule,
        // TimeSlotsModule,
        // PaymentsModule,
        // ReviewsModule,
        // PromotionsModule,
        // NotificationsModule,
        // UploadsModule,

        // // Shared modules
        // StorageModule,
        // MailModule,

        // Business Modules
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

        // Shared Shared
        StorageModule,
        MailModule,
        SmsModule,
        // CacheModule,
        // QueueModule,
        FcmModule,
        TypeOrmModule.forFeature([Permission, Role, User]),
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }