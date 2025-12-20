import { IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';

export class HolidayFilterDto {
    @IsOptional()
    @IsString()
    holidayName?: string;

    @IsOptional()
    @IsBoolean()
    isRecurring?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsDateString()
    fromDate?: string;

    @IsOptional()
    @IsDateString()
    toDate?: string;

    @IsOptional()
    @IsString()
    searchQuery?: string;
}
