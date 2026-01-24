import { IsString, IsOptional, IsEmail, IsDecimal, MinLength, MaxLength, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateVenueDto {
    @ApiProperty({ example: 'Sân bóng đá Thống Nhất' })
    @IsString()
    @MinLength(3)
    name: string;

    @ApiPropertyOptional({ example: 'Sân bóng chất lượng cao với cỏ nhân tạo đạt chuẩn' })
    @IsString()
    @IsOptional()
    @Transform(({ value }) => value === '' ? undefined : value)
    description?: string;

    @ApiProperty({ example: '123 Lý Thường Kiệt, Quận 10' })
    @IsString()
    address: string;

    @ApiProperty({ example: 'Hồ Chí Minh' })
    @IsString()
    city: string;

    @ApiProperty({ example: 'Quận 10' })
    @IsString()
    district: string;

    @ApiPropertyOptional({ example: 'Phường 14' })
    @IsString()
    @IsOptional()
    ward?: string;

    @ApiPropertyOptional({ example: 10.7769 })
    @IsOptional()
    @Type(() => Number)
    latitude?: number;

    @ApiPropertyOptional({ example: 106.6669 })
    @IsOptional()
    @Type(() => Number)
    longitude?: number;

    @ApiPropertyOptional({ example: '0901234567' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ example: 'contact@san-thong-nhat.com' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: '06:00:00' })
    @IsString()
    @IsOptional()
    openingTime?: string;

    @ApiPropertyOptional({ example: '22:00:00' })
    @IsString()
    @IsOptional()
    closingTime?: string;

    @ApiPropertyOptional({ type: [String], example: ['Parking', 'Wifi', 'Changing Room'] })
    @IsArray()
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') return value.split(',').map(v => v.trim());
        return value;
    })
    amenities?: string[];
}

export class UpdateVenueDto extends PartialType(CreateVenueDto) { }
