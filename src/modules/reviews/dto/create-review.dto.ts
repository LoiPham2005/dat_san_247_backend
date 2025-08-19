// src/modules/reviews/dto/create-review.dto.ts
import { IsNumber, IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  field_id: number;

  @IsNumber()
  customer_id: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
