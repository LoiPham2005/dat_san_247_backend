import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { Banner } from './entities/banner.entity';
import { BlogPost } from './entities/blog-post.entity';
import { FAQ } from './entities/faq.entity';
import { Policy } from './entities/policy.entity';
import { EmailTemplate } from './entities/email-template.entity';
import { PromotionContent } from './entities/promotion-content.entity';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Content,
            Banner,
            BlogPost,
            FAQ,
            Policy,
            EmailTemplate,
            PromotionContent,
        ]),
    ],
    providers: [ContentService],
    controllers: [ContentController],
    exports: [ContentService],
})
export class ContentModule { }
