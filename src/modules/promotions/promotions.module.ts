
import { Module } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { OwnerController } from './controllers/owner.controller';
import { AdminPromotionsController } from './controllers/admin.controller';
import { PublicController } from './controllers/public.controller';

@Module({
    controllers: [OwnerController, AdminPromotionsController, PublicController],
    providers: [PromotionsService],
    exports: [PromotionsService],
})
export class PromotionsModule { }
