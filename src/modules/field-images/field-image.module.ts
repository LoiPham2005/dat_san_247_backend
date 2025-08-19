// src/modules/field-images/field-image.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldImageService } from './field-image.service';
import { FieldImageController } from './field-image.controller';
import { FieldImage } from './entities/field-image.entity';
import { SportsField } from '../sports-fields/entities/sports-fields.entities';

@Module({
  imports: [TypeOrmModule.forFeature([FieldImage, SportsField])],
  controllers: [FieldImageController],
  providers: [FieldImageService],
})
export class FieldImageModule {}
