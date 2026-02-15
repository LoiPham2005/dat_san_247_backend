import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/constants/role.constant';

export class RegisterDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    @MinLength(6)
    confirmPassword: string;

    @ApiProperty({ example: 'John Doe' })
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @ApiProperty({ example: '0123456789', required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ enum: UserRole, default: UserRole.CUSTOMER, required: false })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    'cf-turnstile-response'?: string;
}
