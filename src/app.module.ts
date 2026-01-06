import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
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
import { StorageModule } from './shared/storage/storage.module';
import { MailModule } from './shared/mail/mail.module';
import { SmsModule } from './shared/sms/sms.module';
import { CacheModule } from './shared/cache/cache.module';
import { QueueModule } from './shared/queue/queue.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig, databaseConfig],
        }),
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
            }),
        }),
        AuthModule,
        UsersModule,
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
        StorageModule,
        MailModule,
        SmsModule,
        CacheModule,
        QueueModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
