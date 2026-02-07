// import { Module, forwardRef } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { PromotionsService } from './promotions.service';
// import { PromotionsController } from './promotions.controller';
// import { OwnerPromotionsController } from './owner-promotions.controller';
// import { AdminPromotionsController } from './admin-promotions.controller';
// import { Promotion } from './entities/promotion.entity';
// import { PromotionVenue } from './entities/promotion-venue.entity';
// import { PromotionUsage } from './entities/promotion-usage.entity';
// import { NotificationsModule } from '../notifications/notifications.module';
// import { StaffMarketingController } from './staff-marketing.controller';
// import { Venue } from '../venues/entities/venue.entity';
// import { UserVoucher } from './entities/user-voucher.entity';

// @Module({
//   imports: [
//     imports: [
//       forwardRef(() => NotificationsModule),
//     ],
//     controllers: [
//       PromotionsController,
//       OwnerPromotionsController,
//       StaffMarketingController,
//       AdminPromotionsController
//     ],
//     providers: [PromotionsService],
//     exports: [PromotionsService],
// })
// export class PromotionsModule { }



import { Module, forwardRef } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { OwnerPromotionsController } from './owner-promotions.controller';
import { AdminPromotionsController } from './admin-promotions.controller';
import { StaffMarketingController } from './staff-marketing.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    forwardRef(() => NotificationsModule),
  ],
  controllers: [
    PromotionsController,
    OwnerPromotionsController,
    StaffMarketingController,
    AdminPromotionsController,
  ],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
