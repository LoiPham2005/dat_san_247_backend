import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ReportsService } from './reports.service';
import { ReviewsService } from './reviews.service';
import { AdminController } from './controllers/admin.controller';
import { CustomerController } from './controllers/customer.controller';

@Module({
    controllers: [AdminController, CustomerController],
    providers: [TicketsService, ReportsService, ReviewsService],
    exports: [TicketsService, ReportsService, ReviewsService],
})
export class SupportModule { }
