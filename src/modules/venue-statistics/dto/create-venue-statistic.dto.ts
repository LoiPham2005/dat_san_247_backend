import { IsNotEmpty, IsInt, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateVenueStatisticDto {
  @IsNotEmpty()
  @IsInt()
  venueId: number;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsOptional()
  @IsInt()
  totalViews?: number;

  @IsOptional()
  @IsInt()
  totalBookings?: number;

  @IsOptional()
  @IsNumber()
  totalRevenue?: number;

  @IsOptional()
  @IsNumber()
  commissionEarned?: number;

  @IsOptional()
  @IsNumber()
  averageRating?: number;

  @IsOptional()
  @IsInt()
  totalFavorites?: number;

  @IsOptional()
  @IsInt()
  totalMessages?: number;

  @IsOptional()
  @IsNumber()
  cancellationRate?: number;

  @IsOptional()
  @IsInt()
  responseTimeAvg?: number;
}
