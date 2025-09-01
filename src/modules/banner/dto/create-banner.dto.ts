import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
