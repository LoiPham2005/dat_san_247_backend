
import { Module } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { OwnerController } from './controllers/owner.controller';
import { AdminPromotionsController } from './controllers/admin.controller';

@Module({
    controllers: [OwnerController, AdminPromotionsController],
    providers: [PromotionsService],
    exports: [PromotionsService],
})
export class PromotionsModule { }
