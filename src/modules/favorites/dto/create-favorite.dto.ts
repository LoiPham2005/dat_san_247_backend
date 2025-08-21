import { IsNotEmpty, IsInt } from 'class-validator';

export class CreateFavoriteDto {
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @IsNotEmpty()
  @IsInt()
  venueId: number;
}
