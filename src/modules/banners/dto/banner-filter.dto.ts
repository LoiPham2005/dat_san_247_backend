import { IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class BannerFilterDto {
  @IsOptional()
  @IsEnum(['home_top', 'home_middle', 'search_top', 'venue_detail'])
  position?: string;

  @IsOptional()
  @IsEnum(['venue', 'sport_type', 'promotion', 'external'])
  targetType?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}