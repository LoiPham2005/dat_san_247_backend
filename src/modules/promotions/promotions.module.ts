import { Module, forwardRef } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { OwnerPromotionsController } from './owner-promotions.controller';
import { AdminPromotionsController } from './admin-promotions.controller';
import { StaffMarketingController } from './staff-marketing.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
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
export class PromotionsModule { }

