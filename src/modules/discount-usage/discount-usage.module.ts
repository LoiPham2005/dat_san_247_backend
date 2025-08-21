import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountUsageService } from './discount-usage.service';
import { DiscountUsageController } from './discount-usage.controller';
import { DiscountUsage } from './entities/discount-usage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DiscountUsage])],
  controllers: [DiscountUsageController],
  providers: [DiscountUsageService],
  exports: [DiscountUsageService],
})
export class DiscountUsageModule {}
