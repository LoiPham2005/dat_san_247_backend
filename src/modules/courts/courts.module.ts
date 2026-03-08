import { Module } from '@nestjs/common';
import { CourtsService } from './courts.service';
import { PricingService } from './pricing.service';
import { MaintenanceService } from './maintenance.service';
import { PublicController } from './controllers/public.controller';
import { OwnerController } from './controllers/owner.controller';

@Module({
    controllers: [PublicController, OwnerController],
    providers: [CourtsService, PricingService, MaintenanceService],
    exports: [CourtsService],
})
export class CourtsModule { }
