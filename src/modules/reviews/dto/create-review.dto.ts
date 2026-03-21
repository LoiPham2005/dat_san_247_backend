import { IsUUID, IsInt, IsString, IsOptional, Max, Min, IsArray } from 'class-validator';

export class CreateReviewDto {
    @IsUUID()
    booking_id: string;

    @IsInt()
    @Min(1)
    @Max(5)
    rating: number;

    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    rating_cleanliness?: number;

    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    rating_facilities?: number;

    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    rating_staff?: number;

    @IsString()
    @IsOptional()
    comment?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    images?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    videos?: string[];
}
