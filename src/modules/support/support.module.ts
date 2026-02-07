import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportService } from './support.service';
import { SupportTicket } from './entities/support-ticket.entity';
import { StaffSupportController } from './staff-support.controller';
import { SupportController } from './support.controller';

@Module({
    imports: [],
    controllers: [StaffSupportController, SupportController],
    providers: [SupportService],
    exports: [SupportService],
})
export class SupportModule { }
