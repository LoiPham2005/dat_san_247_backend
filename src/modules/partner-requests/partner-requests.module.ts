import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerRequestsService } from './partner-requests.service';
import { PartnerRequestsController } from './partner-requests.controller';
import { PartnerRequest } from './entities/partner-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PartnerRequest])],
  controllers: [PartnerRequestsController],
  providers: [PartnerRequestsService],
  exports: [PartnerRequestsService],
})
export class PartnerRequestsModule {}
