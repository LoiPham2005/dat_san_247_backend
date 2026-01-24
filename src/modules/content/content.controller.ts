import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseInterceptors, UploadedFiles, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ContentService } from './content.service';
import { ContentType } from '../../common/constants/content.constant';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/constants/role.constant';

@ApiTags('Content')
@Controller('content')
export class ContentController {
    constructor(private readonly contentService: ContentService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách nội dung' })
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
