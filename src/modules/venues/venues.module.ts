import { Module } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { VenuesQueryService } from './venues-query.service';
import { VenuesAdminService } from './venues-admin.service';
import { OwnerCourtService } from './owner-courts.service';
// import { VenuesScheduleService } from './venues-schedule.service';
// import { VenuesRefundService } from './venues-refund.service';
import { PublicController } from './controllers/public.controller';
import { OwnerController } from './controllers/owner.controller';
import { AdminController } from './controllers/admin.controller';
import { OwnerCourtsController } from './controllers/owner-courts.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PublicController, OwnerController, AdminController, OwnerCourtsController],
    providers: [
        VenuesService,
        VenuesQueryService,
        VenuesAdminService,
        OwnerCourtService,
        // VenuesScheduleService,
        // VenuesRefundService,
    ],
    exports: [VenuesService, VenuesAdminService, OwnerCourtService, VenuesQueryService],
})
export class VenuesModule { }
