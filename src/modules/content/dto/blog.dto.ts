import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, IsDateString, IsArray, IsObject, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlogCategory, ContentStatus } from '../../../common/constants/content.constant';

export class CreateBlogPostDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty()
    @IsString()
    content: string;

    @ApiProperty({ enum: BlogCategory })
    @IsEnum(BlogCategory)
    category: BlogCategory;

    @ApiProperty()
    @IsString()
    author: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    authorAvatar?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    readingTime?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    featured?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    pinned?: boolean;

    @ApiPropertyOptional({ enum: ContentStatus })
    @IsOptional()
    @IsEnum(ContentStatus)
    status?: ContentStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    publishedAt?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    canonicalUrl?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    relatedPosts?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    tableOfContents?: any;
}

export class UpdateBlogPostDto extends CreateBlogPostDto { }
