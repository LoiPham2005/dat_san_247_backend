import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { OwnerPromotionsController } from './owner-promotions.controller';
import { SuperAdminPromotionsController } from './super-admin-promotions.controller';
import { SuperAdminMarketingController } from './super-admin-marketing.controller';
import { Promotion } from './entities/promotion.entity';
import { PromotionVenue } from './entities/promotion-venue.entity';
import { PromotionUsage } from './entities/promotion-usage.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { StaffMarketingController } from './staff-marketing.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Promotion,
      PromotionVenue,
      PromotionUsage
    ]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [
    PromotionsController,
    SuperAdminPromotionsController,
    OwnerPromotionsController,
    SuperAdminMarketingController,
    StaffMarketingController, 
  ],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule { }
