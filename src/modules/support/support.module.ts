import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportService } from './support.service';
import { StaffSupportController } from './staff-support.controller';
import { Ticket } from './entities/ticket.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Ticket])],
    controllers: [StaffSupportController],
    providers: [SupportService],
    exports: [SupportService],
})
export class SupportModule { }
