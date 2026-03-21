import { IsString, IsNotEmpty, IsUUID, IsDateString, IsArray, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class BookingItemDto {
    @IsUUID()
    @IsNotEmpty()
    court_id: string;

    @IsString()
    @IsNotEmpty()
    start_time: string; // "HH:mm"

    @IsString()
    @IsNotEmpty()
    end_time: string; // "HH:mm"
}

export class CreateBookingDto {
    @IsUUID()
    @IsNotEmpty()
    venue_id: string;

    @IsDateString()
    @IsNotEmpty()
    booking_date: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BookingItemDto)
    items: BookingItemDto[];

    @IsString()
    @IsOptional()
    payment_method?: string;

    @IsString()
    @IsOptional()
    voucher_code?: string;

    @IsString()
    @IsOptional()
    note?: string;
}
