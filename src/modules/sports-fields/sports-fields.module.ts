// src/modules/sports-field/sports-field.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { SportsField } from './entities/sports-fields.entities';
import { SportsFieldController } from './sports-fields.controller';
import { SportsFieldService } from './sports-fields.service';
import { FieldImage } from '../field-images/entities/field-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SportsField, User, FieldImage])],
  controllers: [SportsFieldController],
  providers: [SportsFieldService],
})
export class SportsFieldModule {}
