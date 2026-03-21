import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReviewsService } from '../reviews.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ResponseUtil } from '../../../common/utils/response.util';
import { StorageService } from '../../../shared/storage/storage.service';
import { PrismaService } from '../../../prisma/prisma.service';
import * as path from 'path';

@Controller('customer/reviews')
export class CustomerController {
    constructor(
        private readonly reviewsService: ReviewsService,
        private readonly storageService: StorageService,
        private readonly prisma: PrismaService
    ) {}

    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: any, @Req() req: any) {
        if (!file) {
            throw new BadRequestException('Không tìm thấy tệp đính kèm');
        }
        const url = await this.storageService.upload(file, 'reviews');

        // Save file info to Database
        await this.prisma.files.create({
            data: {
                user_id: req.user.id,
                original_name: file.originalname,
                file_name: path.basename(url),
                file_size: BigInt(file.size || 0),
                mime_type: file.mimetype,
                public_url: url
            }
        });

        return ResponseUtil.success({ url }, 'Đã tải lên tệp thành công');
    }

    @Get('venue/:venueId')
    async getVenueReviews(@Param('venueId') venueId: string) {
        const reviews = await this.reviewsService.getVenueReviews(venueId);
        return ResponseUtil.success(reviews);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async createReview(@Req() req: any, @Body() data: CreateReviewDto) {
        const result = await this.reviewsService.createReview(req.user.id, data);
        return ResponseUtil.success(result, 'Cảm ơn bạn đã đóng góp ý kiến đánh giá!');
    }

    @Get('my-reviews')
    @UseGuards(JwtAuthGuard)
    async getMyReviews(@Req() req: any) {
        const reviews = await this.reviewsService.getMyReviews(req.user.id);
        return ResponseUtil.success(reviews);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async updateReview(@Req() req: any, @Param('id') id: string, @Body() data: UpdateReviewDto) {
        const result = await this.reviewsService.updateReview(req.user.id, id, data);
        return ResponseUtil.success(result, 'Đã cập nhật đánh giá thành công!');
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteReview(@Req() req: any, @Param('id') id: string) {
        await this.reviewsService.deleteReview(req.user.id, id);
        return ResponseUtil.success(null, 'Đã xóa đánh giá thành công!');
    }
}
