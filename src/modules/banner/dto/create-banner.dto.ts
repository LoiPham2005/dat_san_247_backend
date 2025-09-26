import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  cloudinaryId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
