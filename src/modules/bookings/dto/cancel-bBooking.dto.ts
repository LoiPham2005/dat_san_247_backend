import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelBookingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;
}