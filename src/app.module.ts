import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { getTypeOrmConfig } from './config/database.config';
import { getMailerConfig } from './config/mailer.config';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { RefreshTokensModule } from './modules/refresh-tokens/refresh-tokens.module';
import { UserSessionsModule } from './modules/user-sessions/user-sessions.module';
import { UserWalletModule } from './modules/user-wallet/user-wallet.module';
import { SportCategoriesModule } from './modules/sport-categories/sport-categories.module';
import { VenuesModule } from './modules/venues/venues.module';
import { VenueImagesModule } from './modules/venue-images/venue-images.module';
import { VenuePricingModule } from './modules/venue-pricing/venue-pricing.module';
import { VenueOperatingHoursModule } from './modules/venue-operating-hours/venue-operating-hours.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { WalletTransactionsModule } from './modules/wallet-transactions/wallet-transactions.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ReviewRepliesModule } from './modules/review-replies/review-replies.module';
import { ChatRoomsModule } from './modules/chat-rooms/chat-rooms.module';
import { ChatRoomMembersModule } from './modules/chat-room-members/chat-room-members.module';
import { MessagesModule } from './modules/messages/messages.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { DiscountCodesModule } from './modules/discount-codes/discount-codes.module';
import { PartnerRequestsModule } from './modules/partner-requests/partner-requests.module';
import { PartnerResponsesModule } from './modules/partner-responses/partner-responses.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PushNotificationsModule } from './modules/push-notifications/push-notifications.module';
import { VenueStatisticsModule } from './modules/venue-statistics/venue-statistics.module';
import { SearchHistoryModule } from './modules/search-history/search-history.module';
import { SystemSettingsModule } from './modules/system-settings/system-settings.module';
import { AuditLogsModule } from './modules/audit-log/audit-logs.module';
import { ReportsModule } from './modules/report/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    AuthModule,
    DatabaseModule, // DataInitService đã được cung cấp ở đây
    RefreshTokensModule,
    UserSessionsModule,
    UserWalletModule,
    SportCategoriesModule,
    VenuesModule,
    VenueImagesModule,
    VenuePricingModule, 
    VenueOperatingHoursModule,
    BookingsModule,
    PaymentsModule,
    ReviewsModule,
    ReviewRepliesModule,
    WalletTransactionsModule,
    ChatRoomsModule,
    ChatRoomMembersModule,
    MessagesModule,
    FavoritesModule,
    DiscountCodesModule,
    PartnerRequestsModule,
    PartnerResponsesModule,
    NotificationsModule,
    PushNotificationsModule,
    VenueStatisticsModule,
    SearchHistoryModule,
    SystemSettingsModule,
    AuditLogsModule,
    ReportsModule, 
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMailerConfig,
    }), 
  ],
  // providers: [DataInitService],  ← Xóa dòng này
})
export class AppModule { }
