import { IsNotEmpty, IsInt, IsEnum, IsOptional, IsDateString, IsString } from 'class-validator';
import { SkillLevel, RequestStatus } from '../entities/partner-request.entity';

export class CreatePartnerRequestDto {
  @IsNotEmpty()
  @IsInt()
  requesterId: number;

  @IsNotEmpty()
  @IsInt()
  venueId: number;

  @IsNotEmpty()
  @IsInt()
  sportCategoryId: number;

  @IsNotEmpty()
  @IsDateString()
  preferredDate: string;

  @IsNotEmpty()
  preferredTimeStart: string;

  @IsNotEmpty()
  preferredTimeEnd: string;

  @IsOptional()
  @IsEnum(SkillLevel)
  skillLevel?: SkillLevel;

  @IsOptional()
  @IsInt()
  maxPlayers?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  contactInfo?: string;

  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsNotEmpty()
  @IsDateString()
  expiresAt: Date;
}
