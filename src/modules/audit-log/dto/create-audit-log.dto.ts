import { IsOptional, IsString, IsNumber, IsObject } from 'class-validator';

export class CreateAuditLogDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  tableName?: string;

  @IsOptional()
  @IsNumber()
  recordId?: number;

  @IsOptional()
  @IsObject()
  oldValues?: Record<string, any>;

  @IsOptional()
  @IsObject()
  newValues?: Record<string, any>;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
