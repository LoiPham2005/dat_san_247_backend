import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateReportDto {
  @IsOptional()
  @IsEnum(['pending', 'investigating', 'resolved', 'dismissed'])
  status?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  resolvedBy?: number;
}
