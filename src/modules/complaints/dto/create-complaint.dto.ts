// src/modules/complaints/dto/create-complaint.dto.ts
import { IsNumber, IsEnum, IsString } from 'class-validator';
import { ComplaintTargetType, ComplaintStatus } from '../entities/complaint.entity';

export class CreateComplaintDto {
  @IsNumber()
  user_id: number;

  @IsEnum(ComplaintTargetType)
  target_type: ComplaintTargetType;

  @IsNumber()
  target_id: number;

  @IsString()
  reason: string;

  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus;
}
