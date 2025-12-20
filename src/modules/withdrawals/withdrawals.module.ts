import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { WithdrawalRequest } from './entities/withdrawal-request.entity';
import { WithdrawalsService } from './withdrawal.service';
import { WithdrawalsController } from './withdrawals.controller';
import { VenueOwner } from '../venue-owners/entities/venue-owner.entity';
import { CommissionRecord } from '../commissions/entities/commission-record.entity';
import { SettingsModule } from '../settings/settings.module';
import { WithdrawalProcessor } from './processor/withdrawal.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([WithdrawalRequest, VenueOwner, CommissionRecord]),
    BullModule.registerQueue({
      name: 'withdrawals',
    }),
    SettingsModule,
  ],
  controllers: [WithdrawalsController],
  providers: [WithdrawalsService, WithdrawalProcessor],
  exports: [WithdrawalsService],
})
export class WithdrawalsModule { }