import { IsOptional, IsInt, IsString, IsJSON, IsDateString } from 'class-validator';

export class CreateSearchHistoryDto {
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsString()
  searchQuery: string;

  @IsOptional()
  @IsJSON()
  searchFilters?: any;

  @IsOptional()
  @IsInt()
  resultsCount?: number;

  @IsOptional()
  @IsInt()
  clickedVenueId?: number;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsDateString()
  searchDate: string;
}
