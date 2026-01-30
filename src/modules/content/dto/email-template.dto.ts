import { IsString, IsEnum, IsOptional, IsBoolean, IsObject, IsArray, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmailTemplateType, ContentStatus } from '../../../common/constants/content.constant';

export class CreateEmailTemplateDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ enum: EmailTemplateType })
    @IsEnum(EmailTemplateType)
    templateType: EmailTemplateType;

    @ApiProperty()
    @IsString()
    templateName: string;

    @ApiProperty()
    @IsString()
    subject: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    preheader?: string;

    @ApiProperty()
    @IsString()
    htmlContent: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    textContent?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    variables?: any[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    sampleData?: Record<string, any>;

    @ApiProperty()
    @IsString()
    fromName: string;

    @ApiProperty()
    @IsEmail()
    fromEmail: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    replyTo?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;

    @ApiPropertyOptional({ enum: ContentStatus })
    @IsOptional()
    @IsEnum(ContentStatus)
    status?: ContentStatus;
}

export class UpdateEmailTemplateDto extends CreateEmailTemplateDto { }
