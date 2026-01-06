import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { VenueStatus } from '../../../common/constants/venue-status.constant';
import { SportType } from '../../../common/constants/sport-type.constant';

export class VenueFilterDto extends PaginationDto {
    @ApiPropertyOptional({ enum: VenueStatus })
    @IsOptional()
    @IsEnum(VenueStatus)
    status?: VenueStatus;

    @ApiPropertyOptional({ enum: SportType })
    @IsOptional()
    @IsEnum(SportType)
    sportType?: SportType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    city?: string;
}
