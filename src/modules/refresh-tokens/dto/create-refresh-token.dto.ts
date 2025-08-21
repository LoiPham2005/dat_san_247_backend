import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsDate } from 'class-validator';

export class CreateRefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  userId: number;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsBoolean()
  isRevoked?: boolean;

  @IsNotEmpty()
  @IsDate()
  expiresAt: Date;
}
