
import { Module } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { OwnerController } from './controllers/owner.controller';
import { AdminPromotionsController } from './controllers/admin.controller';
import { PublicController } from './controllers/public.controller';
import { CustomerController } from './controllers/customer.controller';

@Module({
    controllers: [OwnerController, AdminPromotionsController, PublicController, CustomerController],
    providers: [PromotionsService],
    exports: [PromotionsService],
})
export class PromotionsModule { }
