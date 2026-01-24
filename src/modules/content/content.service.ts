import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from './entities/content.entity';
import { Banner } from './entities/banner.entity';
import { BlogPost } from './entities/blog-post.entity';
import { FAQ } from './entities/faq.entity';
import { Policy } from './entities/policy.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { PromotionContent } from './entities/promotion-content.entity';
import { ContentType, ContentStatus } from '../../common/constants/content.constant';

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
