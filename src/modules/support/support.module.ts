// modules/support/support.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportTicket } from './entities/support-ticket.entity';
import { SupportMessage } from './entities/support-message.entity';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupportTicket, SupportMessage]),
    SharedModule,
  ],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}