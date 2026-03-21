import { IsUUID, IsEnum, IsDateString, IsOptional, IsArray, IsString, Matches } from 'class-validator';
import { RecurringType, DayOfWeek } from '@prisma/client';

export class CreateRecurringDto {
    @IsUUID()
    venue_id: string;

    @IsUUID()
    court_id: string;

    @IsEnum(RecurringType)
    repeat_type: RecurringType;

    @IsArray()
    @IsEnum(DayOfWeek, { each: true })
    @IsOptional()
    days?: DayOfWeek[];

    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    start_time: string;

    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    end_time: string;

    @IsDateString()
    start_date: string;

    @IsDateString()
    @IsOptional()
    end_date?: string;

    @IsString()
    @IsOptional()
    note?: string;
}
