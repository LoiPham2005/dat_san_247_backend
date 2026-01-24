import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { ContentType } from '../../common/constants/content.constant';

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
    @ApiOperation({ summary: 'Lấy danh sách banners' })
    async findBanners() {
        return this.contentService.findBanners();
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
