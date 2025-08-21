import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenuePricingService } from './venue-pricing.service';
import { VenuePricingController } from './venue-pricing.controller';
import { VenuePricing } from './entities/venue-pricing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VenuePricing])],
  controllers: [VenuePricingController],
  providers: [VenuePricingService],
  exports: [VenuePricingService],
})
export class VenuePricingModule {}
