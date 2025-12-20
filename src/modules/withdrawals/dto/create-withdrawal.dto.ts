import { IsString, IsOptional, IsNumber, IsEnum, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWithdrawalDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty()
  @IsString()
  bankAccount: string;

  @ApiProperty()
  @IsString()
  bankName: string;

  @ApiProperty()
  @IsString()
  accountHolder: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}