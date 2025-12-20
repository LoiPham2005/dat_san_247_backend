// modules/sport-types/sport-types.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportTypesController } from './sport-types.controller';
import { SportTypesService } from './sport-types.service';
import { SportType } from './entities/sport-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SportType])],
  controllers: [SportTypesController],
  providers: [SportTypesService],
  exports: [SportTypesService],
})
export class SportTypesModule { }

