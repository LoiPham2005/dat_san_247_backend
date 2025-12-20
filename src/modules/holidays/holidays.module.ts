import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Holiday } from './entities/holiday.entity';
import { HolidaysService } from './holidays.service';
import { HolidaysController } from './holidays.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Holiday]),
    ScheduleModule.forRoot(),
  ],
  controllers: [HolidaysController],
  providers: [HolidaysService],
  exports: [HolidaysService],
})
export class HolidaysModule {}