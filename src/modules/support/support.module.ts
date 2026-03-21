import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ReportsService } from './reports.service';
import { AdminController } from './controllers/admin.controller';

@Module({
    controllers: [AdminController],
    providers: [TicketsService, ReportsService],
    exports: [TicketsService, ReportsService],
})
export class SupportModule { }
