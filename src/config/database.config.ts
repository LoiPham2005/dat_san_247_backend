import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/auth/entities/user.entity';
import { RefreshToken } from 'src/modules/refresh-tokens/entities/refresh-token.entity';
import { UserSessionsModule } from 'src/modules/user-sessions/user-sessions.module';
import { UserWalletModule } from 'src/modules/user-wallet/user-wallet.module';
import { SportCategoriesModule } from 'src/modules/sport-categories/sport-categories.module';
import { VenuesModule } from 'src/modules/venues/venues.module';
import { VenueImagesModule } from 'src/modules/venue-images/venue-images.module';
import { VenuePricingModule } from 'src/modules/venue-pricing/venue-pricing.module';
import { VenueOperatingHoursModule } from 'src/modules/venue-operating-hours/venue-operating-hours.module';
import { BookingsModule } from 'src/modules/bookings/bookings.module';
import { PaymentsModule } from 'src/modules/payments/payments.module';
import { WalletTransactionsModule } from 'src/modules/wallet-transactions/wallet-transactions.module';
import { ReviewsModule } from 'src/modules/reviews/reviews.module';
import { ReviewRepliesModule } from 'src/modules/review-replies/review-replies.module';
import { ChatRoomsModule } from 'src/modules/chat-rooms/chat-rooms.module';
import { ChatRoomMembersModule } from 'src/modules/chat-room-members/chat-room-members.module';
import { MessagesModule } from 'src/modules/messages/messages.module';
import { FavoritesModule } from 'src/modules/favorites/favorites.module';
import { DiscountCodesModule } from 'src/modules/discount-codes/discount-codes.module';
import { DiscountUsageModule } from 'src/modules/discount-usage/discount-usage.module';
import { PartnerRequestsModule } from 'src/modules/partner-requests/partner-requests.module';
import { PartnerResponsesModule } from 'src/modules/partner-responses/partner-responses.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { PushNotificationsModule } from 'src/modules/push-notifications/push-notifications.module';
import { VenueStatisticsModule } from 'src/modules/venue-statistics/venue-statistics.module';
import { SearchHistoryModule } from 'src/modules/search-history/search-history.module';
import { SystemSettingsModule } from 'src/modules/system-settings/system-settings.module';
import { AuditLogsModule } from 'src/modules/audit-log/audit-logs.module';
import { ReportsModule } from 'src/modules/report/reports.module';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [
        User,
        RefreshToken,
        UserSessionsModule,
        UserWalletModule,
        SportCategoriesModule,
        VenuesModule,
        VenueImagesModule,
        VenuePricingModule,
        VenueOperatingHoursModule,
        BookingsModule,
        PaymentsModule,
        WalletTransactionsModule,
        ReviewsModule,
        ReviewRepliesModule,
        ChatRoomsModule,
        ChatRoomMembersModule,
        MessagesModule,
        FavoritesModule,
        DiscountCodesModule,
        DiscountUsageModule,
        PartnerRequestsModule,
        PartnerResponsesModule,
        NotificationsModule,
        PushNotificationsModule,
        VenueStatisticsModule,
        SearchHistoryModule,
        SystemSettingsModule,
        AuditLogsModule,
        ReportsModule
    ],
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
    autoLoadEntities: true,
});
