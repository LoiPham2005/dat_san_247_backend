import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/role.constant';
import { ReviewsService } from '../reviews.service';

@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
    constructor(private reviewsService: ReviewsService) {}

    @Get()
    getReviews() {
        return this.reviewsService.getAllReviewsForAdmin();
    }

    @Patch(':id/visibility')
    toggleVisibility(@Param('id') id: string, @Body('is_visible') isVisible: boolean) {
        return this.reviewsService.toggleReviewVisibility(id, isVisible);
    }
}
