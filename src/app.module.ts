import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Config
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';
import firebaseConfig from './config/firebase.config';
import sentryConfig from './config/sentry.config';

// Modules
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
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { SupportModule } from './modules/support/support.module';
import { SettingsModule } from './modules/settings/settings.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';

// Shared & Database
import { StorageModule } from './shared/storage/storage.module';
import { MailModule } from './shared/mail/mail.module';
import { SmsModule } from './shared/sms/sms.module';
import { CacheModule } from './shared/cache/cache.module';
import { QueueModule } from './shared/queue/queue.module';
import { DatabaseSeeder } from './database/seeders/database.seeder';
import { Permission } from './modules/permissions/entities/permission.entity';
import { Role } from './modules/roles/entities/role.entity';
import { User } from './modules/users/entities/user.entity';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig, databaseConfig, authConfig, firebaseConfig, sentryConfig],
            cache: true,
        }),

        // Rate Limiting
        ThrottlerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => [
                {
                    ttl: 60000,
                    limit: 100,
                },
            ],
        }),

        // Database
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('database.host'),
                port: configService.get<number>('database.port'),
                username: configService.get<string>('database.username'),
                password: configService.get<string>('database.password'),
                database: configService.get<string>('database.database'),
                autoLoadEntities: true,
                synchronize: configService.get<string>('app.env') === 'development',
                logging: configService.get<boolean>('database.logging') ? ['query', 'error'] : ['error'],
                // dropSchema: true,
            }),
        }),

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
        CacheModule,
        QueueModule,
        TypeOrmModule.forFeature([Permission, Role, User]),
    ],
    controllers: [],
    providers: [
        DatabaseSeeder,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
