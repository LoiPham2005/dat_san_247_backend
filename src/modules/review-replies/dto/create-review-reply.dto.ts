import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { ReviewReplyStatus } from '../entities/review-reply.entity';

export class CreateReviewReplyDto {
  @IsNotEmpty()
  reviewId: number;

  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  @IsString()
  replyText: string;

  @IsEnum(ReviewReplyStatus)
  status?: ReviewReplyStatus;
}
