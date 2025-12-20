// modules/reviews/dto/create-review.dto.ts
import { IsUUID, IsNumber, IsString, IsOptional, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty()
  @IsUUID()
  venueId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  ratingFacility?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  ratingService?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  ratingPrice?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  ratingLocation?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewContent?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  images?: string[];
}

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}

export class OwnerResponseDto {
  @ApiProperty()
  @IsString()
  response: string;
}