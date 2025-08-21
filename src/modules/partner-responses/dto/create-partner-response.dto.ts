import { IsNotEmpty, IsInt, IsEnum, IsOptional, IsString } from 'class-validator';
import { PartnerResponseStatus } from '../entities/partner-response.entity';

export class CreatePartnerResponseDto {
  @IsNotEmpty()
  @IsInt()
  requestId: number;

  @IsNotEmpty()
  @IsInt()
  responderId: number;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  contactInfo?: string;

  @IsOptional()
  @IsEnum(PartnerResponseStatus)
  status?: PartnerResponseStatus;
}
