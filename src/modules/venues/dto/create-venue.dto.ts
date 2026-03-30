import { IsString, IsOptional, IsUrl, IsNotEmpty, IsBoolean, IsNumber } from 'class-validator';

export class CreateVenueDto {
    @IsString()
    @IsNotEmpty({ message: 'Tên cơ sở không được để trống' })
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
    address: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    district?: string;

    @IsString()
    @IsOptional()
    ward?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Link Facebook không hợp lệ' })
    fb_url?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Link Instagram không hợp lệ' })
    instagram_url?: string;

    @IsOptional()
    @IsString()
    zalo_url?: string;

    @IsOptional()
    @IsString()
    youtube_url?: string;

    @IsOptional()
    @IsString()
    thumbnail_url?: string;

    @IsOptional()
    @IsBoolean()
    auto_accept_bookings?: boolean;

    @IsOptional()
    @IsNumber()
    min_booking_hours?: number;

    @IsOptional()
    @IsNumber()
    max_booking_hours?: number;

    @IsOptional()
    @IsNumber()
    min_booking_before_hours?: number;

    @IsOptional()
    @IsNumber()
    cancellation_before_hours?: number;

    @IsOptional()
    @IsNumber()
    vat_rate?: number;

    @IsOptional()
    @IsNumber()
    commission_rate?: number;

    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    longitude?: number;

    @IsOptional()
    @IsString({ each: true })
    sport_types?: string[];
}
