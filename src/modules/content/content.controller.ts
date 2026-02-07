import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseInterceptors, UploadedFile, UploadedFiles, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ContentService } from './content.service';
import { ContentType } from '../../common/constants/content.constant';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/constants/role.constant';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto } from './dto/email-template.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Content')
@Controller('content')
export class ContentController {
    constructor(private readonly contentService: ContentService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách nội dung' })
    @ApiQuery({ name: 'type', enum: ContentType, required: false })
    async findAll(@Query('type') type: ContentType) {
        return this.contentService.findAll(type);
    }

    @Get('banners')
    @ApiOperation({ summary: 'Lấy danh sách banners (Public)' })
    async findBanners() {
        return this.contentService.findBanners();
    }

    @Post('banners')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'image', maxCount: 1 },
        { name: 'mobileImage', maxCount: 1 },
    ]))
    @ApiOperation({ summary: 'Tạo banner mới (Admin)' })
    async createBanner(
        @Body() dto: CreateBannerDto,
        @UploadedFiles() files: { image?: Express.Multer.File[], mobileImage?: Express.Multer.File[] },
        @CurrentUser('id') userId: string,
    ) {
        return this.contentService.createBanner(
            dto,
            {
                image: files?.image?.[0],
                mobileImage: files?.mobileImage?.[0],
            },
            userId
        );
    }

    @Patch('banners/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'image', maxCount: 1 },
        { name: 'mobileImage', maxCount: 1 },
    ]))
    @ApiOperation({ summary: 'Cập nhật banner (Admin)' })
    async updateBanner(
        @Param('id') id: string,
        @Body() dto: UpdateBannerDto,
        @UploadedFiles() files: { image?: Express.Multer.File[], mobileImage?: Express.Multer.File[] },
    ) {
        return this.contentService.updateBanner(
            id,
            dto,
            {
                image: files?.image?.[0],
                mobileImage: files?.mobileImage?.[0],
            }
        );
    }

    @Delete('banners/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: 'Xóa banner (Admin)' })
    async deleteBanner(@Param('id') id: string) {
        return this.contentService.deleteBanner(id);
    }

    @Get('blogs')
    @ApiOperation({ summary: 'Lấy danh sách bài viết blog' })
    async findBlogPosts() {
        return this.contentService.findBlogPosts();
    }

    @Get('blogs/:id')
    @ApiOperation({ summary: 'Chi tiết bài viết blog' })
    async findBlogPost(@Param('id') id: string) {
        return this.contentService.findBlogPostById(id);
    }

    @Post('blogs')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(FileInterceptor('thumbnail'))
    @ApiOperation({ summary: 'Tạo bài viết blog mới (Admin)' })
    async createBlogPost(
        @Body() dto: CreateBlogPostDto,
        @CurrentUser('id') userId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.contentService.createBlogPost(dto, userId, file);
    }

    @Patch('blogs/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(FileInterceptor('thumbnail'))
    @ApiOperation({ summary: 'Cập nhật bài viết blog (Admin)' })
    async updateBlogPost(
        @Param('id') id: string,
        @Body() dto: UpdateBlogPostDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.contentService.updateBlogPost(id, dto, file);
    }

    @Delete('blogs/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: 'Xóa bài viết blog (Admin)' })
    async deleteBlogPost(@Param('id') id: string) {
        return this.contentService.deleteBlogPost(id);
    }

    // Email Template Endpoints
    @Get('email-templates')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: 'Lấy danh sách mẫu email (Admin)' })
    async findEmailTemplates() {
        return this.contentService.findEmailTemplates();
    }

    @Get('email-templates/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: 'Chi tiết mẫu email (Admin)' })
    async findEmailTemplate(@Param('id') id: string) {
        return this.contentService.findEmailTemplateById(id);
    }

    @Post('email-templates')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: 'Tạo mẫu email mới (Admin)' })
    async createEmailTemplate(
        @Body() dto: CreateEmailTemplateDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.contentService.createEmailTemplate(dto, userId);
    }

    @Patch('email-templates/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: 'Cập nhật mẫu email (Admin)' })
    async updateEmailTemplate(
        @Param('id') id: string,
        @Body() dto: UpdateEmailTemplateDto,
    ) {
        return this.contentService.updateEmailTemplate(id, dto);
    }

    @Delete('email-templates/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: 'Xóa mẫu email (Admin)' })
    async deleteEmailTemplate(@Param('id') id: string) {
        return this.contentService.deleteEmailTemplate(id);
    }

    @Post('email-templates/:id/send-test')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiOperation({ summary: 'Gửi email test (Admin)' })
    async sendTestEmail(
        @Param('id') id: string,
        @Body('email') email: string,
    ) {
        return this.contentService.sendTestEmail(id, email);
    }

    @Get('faqs')
    @ApiOperation({ summary: 'Lấy danh sách câu hỏi thường gặp' })
    async findFAQs(@Query('category') category: string) {
        return this.contentService.findFAQs(category);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Chi tiết nội dung' })
    async findOne(@Param('id') id: string) {
        return this.contentService.findOne(id);
    }
}
