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
        private readonly dataSource: DataSource,
    ) { }

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

