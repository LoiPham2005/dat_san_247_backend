import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContentType, ContentStatus } from '../../common/constants/content.constant';
import { StorageService } from '../../shared/storage/storage.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto } from './dto/email-template.dto';
import { MailService } from '../../shared/mail/mail.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ContentService implements OnModuleInit {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
        private readonly mailService: MailService,
    ) { }

    async onModuleInit() {
        await this.seedDefaultEmailTemplates();
    }

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
            scheduledAt: content.scheduled_at,
            expiredAt: content.expired_at,
            seoTitle: content.seo_title,
            seoDescription: content.seo_description,
            seoKeywords: content.seo_keywords,
        };
    }

    private mapBanner(banner: any) {
        if (!banner) return null;
        const { contents, ...rest } = banner;
        return {
            ...rest,
            contentId: banner.content_id,
            mobileImageUrl: banner.mobile_image_url,
            actionType: banner.action_type,
            actionUrl: banner.action_url,
            actionVenueId: banner.action_venue_id,
            actionPromotionId: banner.action_promotion_id,
            autoSlide: banner.auto_slide,
            slideDuration: banner.slide_duration,
            startDate: banner.start_date,
            endDate: banner.end_date,
            displayOnPages: banner.display_on_pages,
            content: this.mapContent(contents)
        };
    }

    private mapBlogPost(post: any) {
        if (!post) return null;
        const { contents, ...rest } = post;
        return {
            ...rest,
            contentId: post.content_id,
            publishedAt: post.published_at,
            lastEditedAt: post.last_edited_at,
            readingTime: post.reading_time,
            authorAvatar: post.author_avatar,
            canonicalUrl: post.canonical_url,
            relatedPosts: post.related_posts,
            tableOfContents: post.table_of_contents,
            content: this.mapContent(contents)
        };
    }

    private mapEmailTemplate(template: any) {
        if (!template) return null;
        const { contents, ...rest } = template;
        return {
            ...rest,
            contentId: template.content_id,
            templateName: template.template_name,
            templateType: template.templateType,
            htmlContent: template.html_content,
            textContent: template.text_content,
            sampleData: template.sample_data,
            layoutId: template.layout_id,
            fromName: template.from_name,
            fromEmail: template.from_email,
            replyTo: template.reply_to,
            isDefault: template.is_default,
            lastUsedAt: template.last_used_at,
            content: this.mapContent(contents)
        };
    }

    private mapFAQ(faq: any) {
        if (!faq) return null;
        const { contents, ...rest } = faq;
        return {
            ...rest,
            contentId: faq.content_id,
            helpfulCount: faq.helpful_count,
            notHelpfulCount: faq.not_helpful_count,
            relatedFaqs: faq.related_faqs,
            relatedArticles: faq.related_articles,
            searchKeywords: faq.search_keywords,
            content: this.mapContent(contents)
        };
    }

    async findAll(type?: ContentType, status: ContentStatus = ContentStatus.PUBLISHED) {
        const contents = await this.prisma.contents.findMany({
            where: {
                status: status,
                type: type ? String(type) : undefined,
            },
            orderBy: { created_at: 'desc' },
        });
        return contents.map(c => this.mapContent(c));
    }

    async findOne(id: string) {
        const content = await this.prisma.contents.findUnique({
            where: { id },
        });
        if (!content) {
            throw new NotFoundException('Content not found');
        }
        return this.mapContent(content);
    }

    async findBanners() {
        const banners = await this.prisma.banners.findMany({
            include: { contents: true },
            orderBy: {
                contents: { display_order: 'asc' }
            }
        });
        return banners.map(b => this.mapBanner(b));
    }

    async findBannerById(id: string) {
        const banner = await this.prisma.banners.findUnique({
            where: { id },
            include: { contents: true },
        });
        if (!banner) throw new NotFoundException('Banner not found');
        return this.mapBanner(banner);
    }

    async createBanner(dto: CreateBannerDto, files: { image?: any, mobileImage?: any }, authorId: string) {
        if (!files.image) {
            throw new BadRequestException('Banners require at least one desktop image');
        }

        // 1. Upload images
        const imageUrl = await this.storageService.uploadFile(files.image, 'banners');
        let mobileImageUrl: string | null = null;
        if (files.mobileImage) {
            mobileImageUrl = await this.storageService.uploadFile(files.mobileImage, 'banners/mobile');
        }

        // 2. Transaction
        // Need to manually fetch the banner after creation to get included content because create with include in $transaction might be tricky if typing is strict, but Prisma supports it.
        const result = await this.prisma.$transaction(async (tx) => {
            const content = await tx.contents.create({
                data: {
                    type: ContentType.BANNER,
                    title: dto.title,
                    description: dto.description,
                    content: dto.title,
                    status: dto.status || ContentStatus.PUBLISHED,
                    author_id: authorId,
                    thumbnail_url: imageUrl,
                    display_order: Number(dto.displayOrder || 0),
                    banners: {
                        create: {
                            position: dto.position,
                            type: dto.type,
                            mobile_image_url: mobileImageUrl,
                            action_type: dto.actionType,
                            action_url: dto.actionUrl,
                            action_venue_id: dto.actionVenueId,
                            action_promotion_id: dto.actionPromotionId,
                            auto_slide: dto.autoSlide,
                            slide_duration: dto.slideDuration,
                            start_date: new Date(dto.startDate),
                            end_date: dto.endDate ? new Date(dto.endDate) : null,
                            display_on_pages: dto.displayOnPages ? dto.displayOnPages as any : undefined,
                        }
                    }
                },
                include: { banners: true }
            });
            return content;
        });

        // Map result
        return this.mapBanner({ ...result.banners, contents: result });
    }

    async updateBanner(id: string, dto: UpdateBannerDto, files: { image?: any, mobileImage?: any }) {
        const currentBanner = await this.prisma.banners.findUnique({
            where: { id },
            include: { contents: true }
        });
        if (!currentBanner) throw new NotFoundException('Banner not found');

        let newImageUrl = currentBanner.contents?.thumbnail_url;

        // Handle image updates
        if (files.image) {
            if (newImageUrl) await this.storageService.deleteFile(newImageUrl);
            newImageUrl = await this.storageService.uploadFile(files.image, 'banners');
        }

        let newMobileImageUrl = currentBanner.mobile_image_url;
        if (files.mobileImage) {
            if (newMobileImageUrl) await this.storageService.deleteFile(newMobileImageUrl);
            newMobileImageUrl = await this.storageService.uploadFile(files.mobileImage, 'banners/mobile');
        }

        return await this.prisma.$transaction(async (tx) => {
            // Update Content
            await tx.contents.update({
                where: { id: currentBanner.content_id },
                data: {
                    title: dto.title,
                    description: dto.description,
                    thumbnail_url: newImageUrl,
                    display_order: dto.displayOrder ? Number(dto.displayOrder) : undefined,
                }
            });

            // Update Banner
            const updatedBanner = await tx.banners.update({
                where: { id },
                data: {
                    position: dto.position,
                    type: dto.type,
                    mobile_image_url: newMobileImageUrl,
                    action_type: dto.actionType,
                    action_url: dto.actionUrl,
                    action_venue_id: dto.actionVenueId,
                    action_promotion_id: dto.actionPromotionId,
                    auto_slide: dto.autoSlide,
                    slide_duration: dto.slideDuration,
                    start_date: dto.startDate ? new Date(dto.startDate) : undefined,
                    end_date: dto.endDate ? new Date(dto.endDate) : undefined,
                    display_on_pages: dto.displayOnPages ? dto.displayOnPages as any : undefined,
                },
                include: { contents: true }
            });
            return this.mapBanner(updatedBanner);
        });
    }

    async deleteBanner(id: string) {
        const banner = await this.prisma.banners.findUnique({ where: { id }, include: { contents: true } });
        if (!banner) return { success: true };

        // Delete images
        if (banner.contents?.thumbnail_url) await this.storageService.deleteFile(banner.contents.thumbnail_url);
        if (banner.mobile_image_url) await this.storageService.deleteFile(banner.mobile_image_url);

        // Delete sequence: Banner -> Content
        await this.prisma.banners.delete({ where: { id } });
        await this.prisma.contents.delete({ where: { id: banner.content_id } });

        return { success: true };
    }

    async findBlogPosts() {
        const posts = await this.prisma.blog_posts.findMany({
            include: { contents: true },
            orderBy: { published_at: 'desc' },
        });
        return posts.map(p => this.mapBlogPost(p));
    }

    async findBlogPostById(id: string) {
        const post = await this.prisma.blog_posts.findUnique({
            where: { id },
            include: { contents: true },
        });
        if (!post) throw new NotFoundException('Blog post not found');
        return this.mapBlogPost(post);
    }

    async createBlogPost(dto: CreateBlogPostDto, authorId: string, thumbnail?: any) {
        let thumbnailUrl: string | undefined = undefined;
        if (thumbnail) {
            thumbnailUrl = await this.storageService.uploadFile(thumbnail, 'blogs');
        }

        const result = await this.prisma.$transaction(async (tx) => {
            const content = await tx.contents.create({
                data: {
                    type: ContentType.BLOG,
                    title: dto.title,
                    description: dto.description,
                    content: dto.content,
                    status: dto.status || ContentStatus.PUBLISHED,
                    author_id: authorId,
                    thumbnail_url: thumbnailUrl,
                    blog_posts: {
                        create: {
                            category: dto.category,
                            author: dto.author,
                            author_avatar: dto.authorAvatar,
                            reading_time: dto.readingTime,
                            table_of_contents: dto.tableOfContents ? dto.tableOfContents as any : undefined,
                            canonical_url: dto.canonicalUrl,
                            related_posts: dto.relatedPosts ? JSON.stringify(dto.relatedPosts) : undefined,
                            published_at: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
                        }
                    }
                },
                include: { blog_posts: true }
            });
            return content;
        });

        // Cast result to access prisma relation
        const created: any = result;
        return this.mapBlogPost({ ...created.blog_posts, contents: created });
    }

    async updateBlogPost(id: string, dto: UpdateBlogPostDto, thumbnail?: any) {
        const post = await this.prisma.blog_posts.findUnique({ where: { id }, include: { contents: true } });
        if (!post) throw new NotFoundException('Blog post not found');

        let thumbnailUrl = post.contents?.thumbnail_url;
        if (thumbnail) {
            if (thumbnailUrl) await this.storageService.deleteFile(thumbnailUrl);
            thumbnailUrl = await this.storageService.uploadFile(thumbnail, 'blogs');
        }

        return await this.prisma.$transaction(async (tx) => {
            await tx.contents.update({
                where: { id: post.content_id },
                data: {
                    title: dto.title,
                    description: dto.description,
                    content: dto.content,
                    status: dto.status,
                    thumbnail_url: thumbnailUrl || undefined,
                }
            });

            const updatedPost = await tx.blog_posts.update({
                where: { id },
                data: {
                    category: dto.category,
                    author: dto.author,
                    author_avatar: dto.authorAvatar,
                    reading_time: dto.readingTime,
                    table_of_contents: dto.tableOfContents ? dto.tableOfContents as any : undefined,
                    canonical_url: dto.canonicalUrl,
                    related_posts: dto.relatedPosts ? JSON.stringify(dto.relatedPosts) : undefined,
                    published_at: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
                    last_edited_at: new Date(),
                },
                include: { contents: true }
            });
            return this.mapBlogPost(updatedPost);
        });
    }

    async deleteBlogPost(id: string) {
        const post = await this.prisma.blog_posts.findUnique({ where: { id }, include: { contents: true } });
        if (!post) return { success: true };

        if (post.contents?.thumbnail_url) await this.storageService.deleteFile(post.contents?.thumbnail_url);

        await this.prisma.blog_posts.delete({ where: { id } });
        await this.prisma.contents.delete({ where: { id: post.content_id } });
        return { success: true };
    }

    // Email Template Methods
    async findEmailTemplates() {
        const templates = await this.prisma.email_templates.findMany({
            include: { contents: true },
            orderBy: { created_at: 'desc' },
        });
        return templates.map(t => this.mapEmailTemplate(t));
    }

    async findEmailTemplateById(id: string) {
        const template = await this.prisma.email_templates.findUnique({
            where: { id },
            include: { contents: true },
        });
        if (!template) throw new NotFoundException('Email template not found');
        return this.mapEmailTemplate(template);
    }

    async createEmailTemplate(dto: CreateEmailTemplateDto, authorId: string | null) {
        const result = await this.prisma.$transaction(async (tx) => {
            const content = await tx.contents.create({
                data: {
                    type: ContentType.EMAIL_TEMPLATE,
                    title: dto.title,
                    description: dto.description,
                    content: dto.subject,
                    status: dto.status || ContentStatus.PUBLISHED,
                    author_id: authorId || undefined,
                    author_type: authorId ? 'ADMIN' : 'SYSTEM',
                    email_templates: {
                        create: {
                            template_name: dto.templateName,
                            subject: dto.subject,
                            templateType: dto.templateType,
                            html_content: dto.htmlContent,
                            from_name: dto.fromName,
                            from_email: dto.fromEmail,
                            sample_data: dto.sampleData ? dto.sampleData : undefined,
                        }
                    }
                },
                include: { email_templates: true }
            });
            return content;
        });

        return this.mapEmailTemplate({ ...result.email_templates, contents: result });
    }

    async updateEmailTemplate(id: string, dto: UpdateEmailTemplateDto) {
        const template = await this.prisma.email_templates.findUnique({ where: { id } });
        if (!template) throw new NotFoundException('Template not found');

        return await this.prisma.$transaction(async (tx) => {
            await tx.contents.update({
                where: { id: template.content_id },
                data: {
                    title: dto.title,
                    description: dto.description,
                    content: dto.subject,
                    status: dto.status,
                }
            });

            const updatedTemplate = await tx.email_templates.update({
                where: { id },
                data: {
                    template_name: dto.templateName,
                    subject: dto.subject,
                    html_content: dto.htmlContent,
                    templateType: dto.templateType,
                    from_name: dto.fromName,
                    from_email: dto.fromEmail,
                    sample_data: dto.sampleData ? dto.sampleData : undefined,
                },
                include: { contents: true }
            });
            return this.mapEmailTemplate(updatedTemplate);
        });
    }

    async deleteEmailTemplate(id: string) {
        const template = await this.prisma.email_templates.findUnique({ where: { id } });
        if (!template) return { success: true };

        await this.prisma.email_templates.delete({ where: { id } });
        await this.prisma.contents.delete({ where: { id: template.content_id } });
        return { success: true };
    }

    async sendTestEmail(templateId: string, testEmail: string) {
        const template = await this.findEmailTemplateById(templateId);
        if (!template) throw new NotFoundException('Template not found');

        const variables = template.sampleData || {
            name: 'Test User',
            otp: '123456',
            bookingId: 'BK12345',
            venueName: 'My Awesome Field',
        };

        return this.mailService.sendWithTemplate(testEmail, template as any, variables);
    }

    async findFAQs(category?: any) {
        const faqs = await this.prisma.faqs.findMany({
            where: category ? { category: category } : undefined,
            include: { contents: true },
            orderBy: { contents: { display_order: 'asc' } }
        });
        return faqs.map(f => this.mapFAQ(f));
    }

    private async seedDefaultEmailTemplates() {
        const templatesDir = path.join(process.cwd(), 'src/shared/mail/templates');
        if (!fs.existsSync(templatesDir)) return;

        const defaultTemplates = [
            {
                key: 'WELCOME',
                file: 'welcome.html',
                title: 'Welcome Email',
                subject: 'Welcome to DatSan247 {{name}}!',
                type: 'WELCOME',
                sampleData: { name: 'New Player', actionUrl: 'https://datsan247.com' }
            },
            {
                key: 'BOOKING_CONFIRMATION',
                file: 'booking_confirmation.html',
                title: 'Booking Confirmation',
                subject: 'Booking Confirmed: {{venueName}}',
                type: 'BOOKING_CONFIRMATION',
                sampleData: {
                    name: 'Player', userId: 'U123', bookingId: 'BK-999',
                    venueName: 'My Stadium', date: '2024-05-20',
                    startTime: '18:00', endTime: '19:00', courtName: 'Court 1',
                    address: '123 Stadium St.', totalPrice: '200,000 VND', bookingUrl: '#'
                }
            },
            {
                key: 'PASSWORD_RESET',
                file: 'password_reset.html',
                title: 'Password Reset',
                subject: 'Your Verification Code',
                type: 'PASSWORD_RESET',
                sampleData: { name: 'User', otp: '123456' }
            }
        ];

        for (const t of defaultTemplates) {
            const exists = await this.prisma.email_templates.findFirst({
                where: { template_name: t.key }
            });

            if (!exists) {
                try {
                    const htmlContent = fs.readFileSync(path.join(templatesDir, t.file), 'utf8');
                    await this.createEmailTemplate({
                        title: t.title,
                        templateName: t.key,
                        subject: t.subject,
                        htmlContent: htmlContent,
                        templateType: t.type as any,
                        fromName: 'DatSan247',
                        fromEmail: 'no-reply@datsan247.com',
                        sampleData: t.sampleData
                    }, null);
                    console.log(`Seeded email template: ${t.key}`);
                } catch (e) {
                    console.error(`Failed to seed template ${t.key}:`, e);
                }
            }
        }
    }
}
