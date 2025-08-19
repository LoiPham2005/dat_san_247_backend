// src/modules/reviews/review.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { SportsField } from '../sports-fields/entities/sports-fields.entities';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, SportsField, User])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
