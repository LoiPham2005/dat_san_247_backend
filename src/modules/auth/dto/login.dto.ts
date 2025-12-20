import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

// modules/auth/dto/login.dto.ts
export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  emailOrPhone: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fcmToken?: string;
}