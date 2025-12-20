import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsUrl, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBannerDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsUrl()
  imageUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiProperty({ enum: ['venue', 'sport_type', 'promotion', 'external'] })
  @IsEnum(['venue', 'sport_type', 'promotion', 'external'])
  targetType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetId?: string;

  @ApiProperty({ enum: ['home_top', 'home_middle', 'search_top', 'venue_detail'] })
  @IsEnum(['home_top', 'home_middle', 'search_top', 'venue_detail'])
  position: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}