// modules/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, Matches, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/user.entity';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0901234567' })
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Phone must be 10 digits' })
  phone: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase and number',
  })
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty({ enum: UserRole, default: UserRole.CUSTOMER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.CUSTOMER;
}