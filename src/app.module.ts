// =====================================================
// COMPLETE APP.MODULE.TS WITH ALL MODULES
// =====================================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';

// Configuration
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

// Guards
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

// Filters & Interceptors
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

// Modules
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VenuesModule } from './modules/venues/venues.module';
import { VenueOwnersModule } from './modules/venue-owners/venue-owners.module';
import { SportTypesModule } from './modules/sport-types/sport-types.module';
import { CourtsModule } from './modules/courts/courts.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { SupportModule } from './modules/support/support.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HealthModule } from './modules/health/health.module';
import { StaffModule } from './modules/staff/staff.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BannersModule } from './modules/banners/banners.module';
import { AppVersionsModule } from './modules/app-versions/app-versions.module';
import { SearchModule } from './modules/search/search.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { SettingsModule } from './modules/settings/settings.module';
import { HolidaysModule } from './modules/holidays/holidays.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, 
        // redisConfig
      ],
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useFactory: () => databaseConfig(),
    }),

    // Cache with Redis
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      ttl: 300, // 5 minutes default
      max: 100, // maximum number of items in cache
    }),

    // Bull Queue for background jobs
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),

    // Schedule for cron jobs
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 100, // 100 requests per minute
    }]),

    // Feature modules
    SharedModule,
    HealthModule,
    AuthModule,
    UsersModule,
    VenuesModule,
    VenueOwnersModule,
    StaffModule,
    SportTypesModule,
    CourtsModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    FavoritesModule,
    VouchersModule,
    NotificationsModule,
    SupportModule,
    BannersModule,
    ActivityLogsModule,
    SettingsModule,
    HolidaysModule,
    CommissionsModule,
    WithdrawalsModule,
    SearchModule,
    AppVersionsModule,
    AnalyticsModule,
  ],
  providers: [
    // Global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global filters
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}