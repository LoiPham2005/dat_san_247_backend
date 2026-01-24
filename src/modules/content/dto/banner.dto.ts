import { IsEnum, IsOptional, IsString, IsBoolean, IsNumber, IsArray, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { BannerPosition, BannerType, ContentStatus } from '../../../common/constants/content.constant';

export class CreateBannerDto {
    @ApiProperty({ enum: BannerPosition, example: BannerPosition.HOME_HERO })
    @IsEnum(BannerPosition)
    position: BannerPosition;

    @ApiProperty({ enum: BannerType, example: BannerType.IMAGE })
    @IsEnum(BannerType)
    type: BannerType;

    @ApiProperty({ example: 'Khuyến mãi đặc biệt' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ example: 'Nội dung chi tiết của banner' })
    @IsString()
    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : value)
    description?: string;

    @ApiPropertyOptional({ example: 'LINK', enum: ['LINK', 'VENUE', 'PROMOTION', 'NONE'] })
    @IsOptional()
    @IsEnum(['LINK', 'VENUE', 'PROMOTION', 'NONE'])
    actionType?: 'LINK' | 'VENUE' | 'PROMOTION' | 'NONE';

    @ApiPropertyOptional({ example: 'https://example.com' })
    @IsString()
    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : value)
    actionUrl?: string;

    @ApiPropertyOptional({ example: 'uuid-of-venue' })
    @IsUUID()
    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : value)
    actionVenueId?: string;

    @ApiPropertyOptional({ example: 'uuid-of-promotion' })
    @IsUUID()
    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : value)
    actionPromotionId?: string;

    @ApiPropertyOptional({ example: 0 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    displayOrder?: number;

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true || value === 1 || value === '1') return true;
        if (value === 'false' || value === false || value === 0 || value === '0') return false;
        return value;
    })
    autoSlide?: boolean;

    @ApiPropertyOptional({ example: 5000 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    slideDuration?: number;

    @ApiProperty({ example: '2024-01-24T00:00:00Z' })
    @IsDateString()
    startDate: string;

    @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z' })
    @IsDateString()
    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : value)
    endDate?: string;

    @ApiPropertyOptional({ type: [String], example: ['HOME', 'VENUES'] })
    @IsArray()
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') return value.split(',').map(v => v.trim());
        return value;
    })
    displayOnPages?: string[];

    @ApiPropertyOptional({ enum: ContentStatus })
    @IsEnum(ContentStatus)
    @IsOptional()
    status?: ContentStatus;
}

export class UpdateBannerDto extends CreateBannerDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(BannerPosition)
    declare position: BannerPosition;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(BannerType)
    declare type: BannerType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    declare title: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    declare startDate: string;
}
