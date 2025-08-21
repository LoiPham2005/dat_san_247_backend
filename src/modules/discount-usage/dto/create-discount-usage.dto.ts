import { IsNotEmpty, IsInt, IsNumber } from 'class-validator';

export class CreateDiscountUsageDto {
  @IsNotEmpty()
  @IsInt()
  codeId: number;

  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsInt()
  bookingId: number;

  @IsNotEmpty()
  @IsNumber()
  discountAmount: number;
}
