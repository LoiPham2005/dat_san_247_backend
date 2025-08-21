import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Report } from './entities/report.entity';
import { User } from '../auth/entities/user.entity';
import { Venue } from '../venues/entities/venue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, User, Venue])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
