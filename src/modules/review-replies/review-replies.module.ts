import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewRepliesService } from './review-replies.service';
import { ReviewRepliesController } from './review-replies.controller';
import { ReviewReply } from './entities/review-reply.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewReply])],
  controllers: [ReviewRepliesController],
  providers: [ReviewRepliesService],
  exports: [ReviewRepliesService],
})
export class ReviewRepliesModule {}
