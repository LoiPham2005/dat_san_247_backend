import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';
import { OtpType } from '@prisma/client';

export class ResendOtpDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsEnum(OtpType)
    type: OtpType;
}
