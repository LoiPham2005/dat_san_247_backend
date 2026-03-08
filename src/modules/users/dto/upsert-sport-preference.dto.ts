import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';

export class UpsertSportPreferenceDto {
    @IsNotEmpty()
    @IsString()
    sport_type: string;

    @IsInt()
    @Min(1)
    @Max(5)
    skill_level: number;
}
