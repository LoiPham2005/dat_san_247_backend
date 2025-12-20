// modules/bookings/dto/create-booking.dto.ts
import { IsUUID, IsDateString, IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @ApiProperty()
  @IsUUID()
  courtId: string;

  @ApiProperty({ example: '2024-12-25' })
  @IsDateString()
  bookingDate: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  endTime: string;

  @ApiProperty()
  @IsString()
  customerName: string;

  @ApiProperty()
  @IsString()
  customerPhone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  voucherCode?: string;
}