import { IsNotEmpty, IsInt, IsOptional, IsEnum, IsArray, Max, Min, IsString } from 'class-validator';
import { ReviewStatus } from '../entities/review.entity';

export class CreateReviewDto {
  @IsNotEmpty()
  bookingId: number;

  @IsNotEmpty()
  customerId: number;

  @IsNotEmpty()
  venueId: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  reviewText?: string;

  @IsOptional()
  pros?: string;

  @IsOptional()
  cons?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;
}
