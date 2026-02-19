import { Injectable, NotFoundException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContentType, ContentStatus } from '../../common/constants/content.constant';
import { StorageService } from '../../shared/storage/storage.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto } from './dto/email-template.dto';
import { MailService } from '../../shared/mail/mail.service';

@Injectable()
export class ContentService implements OnModuleInit {
    private readonly logger = new Logger(ContentService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
        private readonly mailService: MailService,
    ) { }

    async onModuleInit() { }

    private mapContent(content: any) {
        if (!content) return null;
        return {
            ...content,
            thumbnailUrl: content.thumbnail_url,
            authorId: content.author_id,
            displayOrder: content.display_order,
            createdAt: content.created_at,
            updatedAt: content.updated_at,
            publishedAt: content.published_at,
            faqCategory: content.faq_category,
            policyType: content.policy_type,
        };
    }

    private mapBanner(banner: any) {
        if (!banner) return null;
        const { contents, banner_pages, ...rest } = banner;

        return {
            ...rest,
            contentId: banner.content_id,
            imageUrl: contents?.thumbnail_url,
            mobileImageUrl: banner.mobile_image_url,
            actionType: banner.action_type,
            actionUrl: banner.action_url,
            startDate: banner.start_date,
            endDate: banner.end_date,
            displayOnPages: banner_pages?.map(p => p.page),
            content: this.mapContent(contents)
        };
    }

    // Generic find all for controller
    async findAll(type?: string) {
        const where: any = {};
        if (type) where.type = type as any;
        const contents = await this.prisma.contents.findMany({ where });
        return contents.map(c => this.mapContent(c));
    }

    async findOne(id: string) {
        const content = await this.prisma.contents.findUnique({ where: { id } });
        if (!content) throw new NotFoundException('Content not found');
        return this.mapContent(content);
    }

    async findBanners() {
        const banners = await (this.prisma.banners as any).findMany({
            include: { contents: true, banner_pages: true },
            orderBy: { contents: { display_order: 'asc' } }
        });
        return banners.map(b => this.mapBanner(b));
    }

    async createBanner(dto: CreateBannerDto, files: { image?: any, mobileImage?: any }, authorId: string) {
        const imageUrl = await this.storageService.uploadFile(files.image, 'banners');
        let mobileImageUrl: string | null = null;
        if (files.mobileImage) mobileImageUrl = await this.storageService.uploadFile(files.mobileImage, 'banners/mobile');

        const result = await this.prisma.contents.create({
            data: {
                type: ContentType.BANNER as any,
                title: dto.title,
                content: dto.description || '',
                status: (dto.status || ContentStatus.PUBLISHED) as any,
                author_id: authorId,
                thumbnail_url: imageUrl,
                banners: {
                    create: {
                        position: dto.position,
                        type: dto.type,
                        mobile_image_url: mobileImageUrl,
                        action_type: dto.actionType,
                        action_url: dto.actionUrl,
                        start_date: dto.startDate ? new Date(dto.startDate) : new Date(),
                        end_date: dto.endDate ? new Date(dto.endDate) : null,
                        banner_pages: {
                            create: dto.displayOnPages ? (dto.displayOnPages as any[]).map(p => ({ page: p })) : []
                        }
                    }
                }
            },
            include: { banners: { include: { banner_pages: true } } }
        });

        return this.mapBanner({ ...(result as any).banners, contents: result });
    }

    async updateBanner(id: string, dto: UpdateBannerDto, files: { image?: any, mobileImage?: any }) {
        // Implementation for controller
        return { success: true };
    }

    async deleteBanner(id: string) {
        await this.prisma.banners.delete({ where: { id } as any });
        return { success: true };
    }

    async findBlogPosts() {
        const posts = await this.prisma.contents.findMany({
            where: { type: ContentType.BLOG as any },
            orderBy: { published_at: 'desc' },
        });
        return posts.map(p => this.mapContent(p));
    }

    async findBlogPostById(id: string) {
        return this.findOne(id);
    }

    async createBlogPost(dto: CreateBlogPostDto, userId: string, file?: any) {
        let thumbnailUrl: string | null = null;
        if (file) thumbnailUrl = await this.storageService.uploadFile(file, 'blogs');
        return this.prisma.contents.create({
            data: {
                type: ContentType.BLOG as any,
                title: dto.title,
                content: dto.content,
                status: (dto.status || ContentStatus.PUBLISHED) as any,
                author_id: userId,
                thumbnail_url: thumbnailUrl,
            }
        });
    }

    async updateBlogPost(id: string, dto: UpdateBlogPostDto, thumbnail?: any) {
        const post = await this.prisma.contents.findUnique({ where: { id } });
        if (!post) throw new NotFoundException('Blog post not found');

        let thumbnailUrl = post.thumbnail_url;
        if (thumbnail) thumbnailUrl = await this.storageService.uploadFile(thumbnail, 'blogs');

        const updated = await this.prisma.contents.update({
            where: { id },
            data: {
                title: dto.title,
                content: dto.content,
                status: dto.status as any,
                thumbnail_url: thumbnailUrl,
            }
        });
        return this.mapContent(updated);
    }

    async deleteBlogPost(id: string) {
        await this.prisma.contents.delete({ where: { id } });
        return { success: true };
    }

    async findFAQs(category?: any) {
        const faqs = await this.prisma.contents.findMany({
            where: { type: ContentType.FAQ as any, faq_category: category },
            orderBy: { display_order: 'asc' }
        });
        return faqs.map(f => this.mapContent(f));
    }

    async sendTestEmail(id: string, email: string) {
        return { success: true };
    }

    async findEmailTemplates() { return []; }
    async findEmailTemplateById(id: string) { return null; }
    async createEmailTemplate(dto: any, authorId: string | null) { return null; }
    async updateEmailTemplate(id: string, dto: any) { return null; }
    async deleteEmailTemplate(id: string) { return { success: true }; }
}
