import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ReviewFilterDto } from './dto/review-filter.dto';
import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';
import { Review } from './entities/review.entity';

@ApiTags('Super Admin - Reviews')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN)
@UseGuards(RolesGuard)
@Controller('super-admin/reviews')
export class SuperAdminReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Get()
    @ApiOperation({ summary: 'Danh sách đánh giá toàn hệ thống' })
    @ApiPaginatedResponse(Review)
    async findAll(@Query() filter: ReviewFilterDto) {
        return this.reviewsService.findAll(filter);
    }

    @Post(':id/toggle-visibility')
    @ApiOperation({ summary: 'Ẩn/Hiện đánh giá' })
    @ApiSuccessResponse()
    async toggleVisibility(@Param('id') id: string) {
        return this.reviewsService.toggleVisibility(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa đánh giá' })
    @ApiSuccessResponse()
    async remove(@Param('id') id: string) {
        return this.reviewsService.softDelete(id);
    }
}
