import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Content } from './entities/content.entity';
import { Banner } from './entities/banner.entity';
import { BlogPost } from './entities/blog-post.entity';
import { FAQ } from './entities/faq.entity';
import { Policy } from './entities/policy.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { PromotionContent } from './entities/promotion-content.entity';
import { ContentType, ContentStatus } from '../../common/constants/content.constant';
import { StorageService } from '../../shared/storage/storage.service';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto } from './dto/email-template.dto';
import { MailService } from '../../shared/mail/mail.service';
import * as fs from 'fs';
import * as path from 'path';
import { OnModuleInit } from '@nestjs/common';

@Injectable()
export class ContentService {
    constructor(
        @InjectRepository(Content)
        private readonly contentRepository: Repository<Content>,
        @InjectRepository(Banner)
        private readonly bannerRepository: Repository<Banner>,
        @InjectRepository(BlogPost)
        private readonly blogPostRepository: Repository<BlogPost>,
        @InjectRepository(FAQ)
        private readonly faqRepository: Repository<FAQ>,
        @InjectRepository(Policy)
        private readonly policyRepository: Repository<Policy>,
        @InjectRepository(EmailTemplate)
        private readonly emailTemplateRepository: Repository<EmailTemplate>,
        @InjectRepository(PromotionContent)
        private readonly promotionContentRepository: Repository<PromotionContent>,
        private readonly storageService: StorageService,
        private readonly mailService: MailService,
        private readonly dataSource: DataSource,
    ) { }

    async onModuleInit() {
        this.seedDefaultEmailTemplates();
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
            const exists = await this.emailTemplateRepository.findOne({ where: { templateName: t.key } });
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
                    }, 'SYSTEM_SEED');
                    console.log(`Seeded email template: ${t.key}`);
                } catch (e) {
                    console.error(`Failed to seed template ${t.key}:`, e);
                }
            }
        }
    }

    async findAll(type?: ContentType, status: ContentStatus = ContentStatus.PUBLISHED) {
        const query = this.contentRepository.createQueryBuilder('content')
            .where('content.status = :status', { status });

        if (type) {
            query.andWhere('content.type = :type', { type });
        }

        return query.orderBy('content.createdAt', 'DESC').getMany();
    }

    async findOne(id: string) {
        const content = await this.contentRepository.findOne({
            where: { id },
        });

        if (!content) {
            throw new NotFoundException('Content not found');
        }

        return content;
    }

    async findBanners() {
        return this.bannerRepository.find({
            relations: ['content'],
            order: { displayOrder: 'ASC' },
        });
    }

    async findBannerById(id: string) {
        const banner = await this.bannerRepository.findOne({
            where: { id },
            relations: ['content'],
        });
        if (!banner) throw new NotFoundException('Banner not found');
        return banner;
    }

    async createBanner(dto: CreateBannerDto, files: { image?: any, mobileImage?: any }, authorId: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (!files.image) {
                throw new BadRequestException('Banners require at least one desktop image');
            }

            // 1. Upload images
            const imageUrl = await this.storageService.uploadFile(files.image, 'banners');
            let mobileImageUrl: string | null = null;
            if (files.mobileImage) {
                mobileImageUrl = await this.storageService.uploadFile(files.mobileImage, 'banners/mobile');
            }

            // 2. Create Content record first
            const content = queryRunner.manager.create(Content, {
                type: ContentType.BANNER,
                title: dto.title,
                description: dto.description,
                content: dto.title, // Required field
                status: dto.status || ContentStatus.PUBLISHED,
                authorId,
                thumbnailUrl: imageUrl,
            });
            const savedContent = await queryRunner.manager.save(content);

            // 3. Create Banner record
            const banner = new Banner();
            Object.assign(banner, {
                contentId: savedContent.id,
                position: dto.position,
                type: dto.type,
                imageUrl,
                mobileImageUrl,
                actionType: dto.actionType,
                actionUrl: dto.actionUrl,
                actionVenueId: dto.actionVenueId,
                actionPromotionId: dto.actionPromotionId,
                displayOrder: Number(dto.displayOrder || 0),
                autoSlide: dto.autoSlide,
                slideDuration: dto.slideDuration,
                startDate: new Date(dto.startDate),
                endDate: dto.endDate ? new Date(dto.endDate) : null,
                displayOnPages: dto.displayOnPages,
            });

            const savedBanner = await queryRunner.manager.save(banner);
            await queryRunner.commitTransaction();
            return savedBanner;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateBanner(id: string, dto: UpdateBannerDto, files: { image?: any, mobileImage?: any }) {
        const banner = await this.findBannerById(id);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Handle image updates
            if (files.image) {
                // Delete old image
                if (banner.imageUrl) await this.storageService.deleteFile(banner.imageUrl);
                banner.imageUrl = await this.storageService.uploadFile(files.image, 'banners');
            }

            if (files.mobileImage) {
                if (banner.mobileImageUrl) await this.storageService.deleteFile(banner.mobileImageUrl);
                banner.mobileImageUrl = await this.storageService.uploadFile(files.mobileImage, 'banners/mobile');
            }

            // Update Content
            await queryRunner.manager.update(Content, banner.contentId, {
                title: dto.title,
                description: dto.description,
                thumbnailUrl: banner.imageUrl,
            });

            // Update Banner
            Object.assign(banner, {
                ...dto,
                startDate: dto.startDate ? new Date(dto.startDate) : banner.startDate,
                endDate: dto.endDate ? new Date(dto.endDate) : banner.endDate,
            });

            const updatedBanner = await queryRunner.manager.save(banner);
            await queryRunner.commitTransaction();
            return updatedBanner;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async deleteBanner(id: string) {
        const banner = await this.findBannerById(id);

        // Delete images from Supabase
        if (banner.imageUrl) await this.storageService.deleteFile(banner.imageUrl);
        if (banner.mobileImageUrl) await this.storageService.deleteFile(banner.mobileImageUrl);

        // Delete records
        await this.bannerRepository.remove(banner);
        await this.contentRepository.delete(banner.contentId);

        return { success: true };
    }

    async findBlogPosts() {
        return this.blogPostRepository.find({
            relations: ['content'],
            order: { publishedAt: 'DESC' },
        });
    }

    async findBlogPostById(id: string) {
        const post = await this.blogPostRepository.findOne({
            where: { id },
            relations: ['content'],
        });
        if (!post) throw new NotFoundException('Blog post not found');
        return post;
    }

    async createBlogPost(dto: CreateBlogPostDto, authorId: string, thumbnail?: any) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let thumbnailUrl: string | undefined = undefined;
            if (thumbnail) {
                thumbnailUrl = await this.storageService.uploadFile(thumbnail, 'blogs');
            }

            const content = queryRunner.manager.create(Content, {
                type: ContentType.BLOG,
                title: dto.title,
                description: dto.description,
                content: dto.content,
                status: dto.status || ContentStatus.PUBLISHED,
                authorId,
                thumbnailUrl,
            });
            const savedContent = await queryRunner.manager.save(content);

            const { content: dtoContent, ...postData } = dto;
            const post = queryRunner.manager.create(BlogPost, {
                ...postData,
                contentId: savedContent.id,
                publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
            });

            const savedPost = await queryRunner.manager.save(post);
            await queryRunner.commitTransaction();
            return savedPost;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateBlogPost(id: string, dto: UpdateBlogPostDto, thumbnail?: any) {
        const post = await this.findBlogPostById(id);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (thumbnail) {
                if (post.content.thumbnailUrl) await this.storageService.deleteFile(post.content.thumbnailUrl);
                post.content.thumbnailUrl = await this.storageService.uploadFile(thumbnail, 'blogs');
            }

            await queryRunner.manager.update(Content, post.contentId, {
                title: dto.title,
                description: dto.description,
                content: dto.content,
                status: dto.status,
                thumbnailUrl: post.content.thumbnailUrl || undefined,
            });

            const { content: dtoContent, ...postData } = dto;
            Object.assign(post, {
                ...postData,
                publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : post.publishedAt,
                lastEditedAt: new Date(),
            });

            const updatedPost = await queryRunner.manager.save(post);
            await queryRunner.commitTransaction();
            return updatedPost;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async deleteBlogPost(id: string) {
        const post = await this.findBlogPostById(id);
        if (post.content.thumbnailUrl) await this.storageService.deleteFile(post.content.thumbnailUrl);
        await this.blogPostRepository.remove(post);
        await this.contentRepository.delete(post.contentId);
        return { success: true };
    }

    // Email Template Methods
    async findEmailTemplates() {
        return this.emailTemplateRepository.find({
            relations: ['content'],
            order: { createdAt: 'DESC' },
        });
    }

    async findEmailTemplateById(id: string) {
        const template = await this.emailTemplateRepository.findOne({
            where: { id },
            relations: ['content'],
        });
        if (!template) throw new NotFoundException('Email template not found');
        return template;
    }

    async createEmailTemplate(dto: CreateEmailTemplateDto, authorId: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const content = queryRunner.manager.create(Content, {
                type: ContentType.EMAIL_TEMPLATE,
                title: dto.title,
                description: dto.description,
                content: dto.subject, // Store subject in content for overview
                status: dto.status || ContentStatus.PUBLISHED,
                authorId,
            });
            const savedContent = await queryRunner.manager.save(content);

            const template = queryRunner.manager.create(EmailTemplate, {
                ...dto,
                contentId: savedContent.id,
            });

            const savedTemplate = await queryRunner.manager.save(template);
            await queryRunner.commitTransaction();
            return savedTemplate;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateEmailTemplate(id: string, dto: UpdateEmailTemplateDto) {
        const template = await this.findEmailTemplateById(id);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            await queryRunner.manager.update(Content, template.contentId, {
                title: dto.title,
                description: dto.description,
                content: dto.subject,
                status: dto.status,
            });

            Object.assign(template, dto);

            const updatedTemplate = await queryRunner.manager.save(template);
            await queryRunner.commitTransaction();
            return updatedTemplate;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async deleteEmailTemplate(id: string) {
        const template = await this.findEmailTemplateById(id);
        await this.emailTemplateRepository.remove(template);
        await this.contentRepository.delete(template.contentId);
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

        return this.mailService.sendWithTemplate(testEmail, template, variables);
    }

    async findFAQs(category?: any) {
        const where: any = {};
        if (category) {
            where.category = category;
        }
        return this.faqRepository.find({
            where,
            relations: ['content'],
            order: { displayOrder: 'ASC' },
        });
    }
}

