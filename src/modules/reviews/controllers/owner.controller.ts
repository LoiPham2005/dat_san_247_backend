import { Controller, Get, Post, Body, Param, UseGuards, Req, Query, Patch } from '@nestjs/common';
import { ReviewsService } from '../reviews.service';
import { ReplyReviewDto } from '../dto/reply-review.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/role.constant';
import { ResponseUtil } from '../../../common/utils/response.util';

@Controller('owner/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.SUPER_ADMIN, UserRole.VENUE_STAFF)
export class OwnerController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @Get()
    async getReviews(@Req() req: any, @Query('venue_id') venueId?: string) {
        const reviews = await this.reviewsService.getOwnerReviews(req.user.id, venueId);
        return ResponseUtil.success(reviews);
    }

    @Patch(':id/reply')
    async reply(@Req() req: any, @Param('id') id: string, @Body() data: ReplyReviewDto) {
        const result = await this.reviewsService.replyToReview(req.user.id, id, data);
        return ResponseUtil.success(result, 'Đã phản hồi đánh giá khách hàng');
    }
}
