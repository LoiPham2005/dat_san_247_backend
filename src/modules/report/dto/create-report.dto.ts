import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class CreateReportDto {
  @IsInt()
  reporterId: number;

  @IsOptional()
  @IsInt()
  reportedVenueId?: number;

  @IsOptional()
  @IsInt()
  reportedUserId?: number;

  @IsEnum(['inappropriate_content', 'fake_info', 'poor_service', 'fraud', 'spam', 'other'])
  reportType: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  evidenceUrls?: string[];
}
