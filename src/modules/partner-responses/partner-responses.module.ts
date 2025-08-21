import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnerResponsesService } from './partner-responses.service';
import { PartnerResponsesController } from './partner-responses.controller';
import { PartnerResponse } from './entities/partner-response.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PartnerResponse])],
  controllers: [PartnerResponsesController],
  providers: [PartnerResponsesService],
  exports: [PartnerResponsesService],
})
export class PartnerResponsesModule {}
