import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { BookingStatus } from '../../../common/constants/booking-status.constant';

export class BookingFilterDto extends PaginationDto {
    @ApiPropertyOptional({ enum: BookingStatus })
    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    date?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    venueId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;
}
