import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    'cf-turnstile-response'?: string;
}

export class ResetPasswordDto {
    @ApiProperty({ example: '123456' })
    @IsString()
    @IsNotEmpty()
    otp: string;

    @ApiProperty({ example: 'newpassword123' })
    @IsString()
    @MinLength(6)
    newPassword: string;
}
