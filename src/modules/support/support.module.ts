import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportService } from './support.service';
import { Ticket } from './entities/ticket.entity';
import { StaffSupportController } from './staff-support.controller';
import { SupportController } from './support.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Ticket])],
    controllers: [StaffSupportController, SupportController],
    providers: [SupportService],
    exports: [SupportService],
})
export class SupportModule { }
