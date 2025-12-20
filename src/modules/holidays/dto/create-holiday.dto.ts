import { IsString, IsOptional, IsDateString, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHolidayDto {
  @ApiProperty({ example: '2024-12-25' })
  @IsDateString()
  holidayDate: string;

  @ApiProperty({ example: 'Giáng Sinh' })
  @IsString()
  holidayName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({ example: 1.5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  priceMultiplier?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}