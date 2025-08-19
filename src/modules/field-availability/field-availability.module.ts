// src/modules/field-availability/field-availability.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldAvailability } from './entities/field-availability.entity';
import { FieldAvailabilityService } from './field-availability.service';
import { FieldAvailabilityController } from './field-availability.controller';
import { SportsField } from '../sports-fields/entities/sports-fields.entities';

@Module({
  imports: [TypeOrmModule.forFeature([FieldAvailability, SportsField])],
  controllers: [FieldAvailabilityController],
  providers: [FieldAvailabilityService],
})
export class FieldAvailabilityModule {}
