import { Controller, Get, Post, Put, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VenuesService } from './venues.service';
import { UsersService } from '../users/users.service';
import { ReviewsService } from '../reviews/reviews.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';
import { VenueStatus } from '../../common/constants/venue-status.constant';

@ApiTags('Staff - Moderation')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.ADMIN_STAFF)
@UseGuards(RolesGuard)
@Controller('admin-staff/moderation')
export class StaffModerationController {
    constructor(
        private readonly venuesService: VenuesService,
        private readonly usersService: UsersService,
        private readonly reviewsService: ReviewsService,
    ) { }

    @Get('venues/pending')
    @ApiOperation({ summary: 'Danh sách sân chờ duyệt' })
    @ApiSuccessResponse()
    async getPendingVenues() {
        return this.venuesService.findAll({ status: VenueStatus.PENDING } as any);
    }

    @Post('venues/:id/approve')
    @ApiOperation({ summary: 'Duyệt sân' })
    @ApiSuccessResponse()
    async approveVenue(@Param('id') id: string) {
        return this.venuesService.updateStatus(id, VenueStatus.APPROVED);
    }

    @Post('venues/:id/reject')
    @ApiOperation({ summary: 'Từ chối sân' })
    @ApiSuccessResponse()
    async rejectVenue(@Param('id') id: string, @Body('reason') reason: string) {
        return this.venuesService.updateStatus(id, VenueStatus.REJECTED, reason);
    }

    @Put('reviews/:id/visibility')
    @ApiOperation({ summary: 'Ẩn/Hiện đánh giá' })
    @ApiSuccessResponse()
    async toggleReview(@Param('id') id: string, @Body('isVisible') isVisible: boolean) {
        return this.reviewsService.toggleVisibility(id, isVisible);
    }
}
