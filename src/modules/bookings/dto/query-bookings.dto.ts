import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class QueryBookingsDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;

    @IsOptional()
    @IsEnum(PaymentStatus)
    payment_status?: PaymentStatus;

    @IsOptional()
    @IsString()
    venue_id?: string;

    @IsOptional()
    @IsDateString()
    start_date?: string;

    @IsOptional()
    @IsDateString()
    end_date?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;
}
