import { IsString, IsInt, Min, Max, IsOptional, IsArray } from 'class-validator';

export class UpdateReviewDto {
    @IsInt()
    @Min(1)
    @Max(5)
    @IsOptional()
    rating?: number;

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
