import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportService } from './support.service';
import { SuperAdminSupportController } from './super-admin-support.controller';
import { Ticket } from './entities/ticket.entity';
import { StaffSupportController } from './staff-support.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Ticket])],
    controllers: [SuperAdminSupportController, StaffSupportController ],
    providers: [SupportService],
    exports: [SupportService],
})
export class SupportModule { }
