import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VenuesService } from './venues.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VenueFilterDto } from './dto/venue-filter.dto';
import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';
import { VenueStatus } from '../../common/constants/venue-status.constant';

@ApiTags('Admin - Venues')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/venues')
export class AdminVenuesController {
    constructor(private readonly venuesService: VenuesService) { }

    @Get()
    @ApiOperation({ summary: 'Danh sách sân toàn hệ thống' })
    @ApiPaginatedResponse(Object)
    async findAll(@Query() filter: VenueFilterDto) {
        return this.venuesService.findAll(filter);
    }

    @Get('pending')
    @ApiOperation({ summary: 'Danh sách sân chờ duyệt' })
    @ApiPaginatedResponse(Object)
    async findPending(@Query() filter: VenueFilterDto) {
        filter.status = VenueStatus.PENDING;
        return this.venuesService.findAll(filter);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Chi tiết sân' })
    @ApiSuccessResponse(Object)
    async findOne(@Param('id') id: string) {
        return this.venuesService.findOne(id);
    }

    @Post(':id/approve')
    @ApiOperation({ summary: 'Duyệt sân' })
    @ApiSuccessResponse()
    async approve(@Param('id') id: string, @Req() req: any) {
        return this.venuesService.updateStatus(id, VenueStatus.APPROVED, undefined, req.user.id);
    }

    @Post(':id/reject')
    @ApiOperation({ summary: 'Từ chối sân' })
    @ApiSuccessResponse()
    async reject(@Param('id') id: string, @Body('reason') reason: string, @Req() req: any) {
        return this.venuesService.updateStatus(id, VenueStatus.REJECTED, reason, req.user.id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật thông tin sân' })
    @ApiSuccessResponse()
    async update(@Param('id') id: string, @Body() data: any) {
        return this.venuesService.update(id, data);
    }

    @Put(':id/toggle-featured')
    @ApiOperation({ summary: 'Đánh dấu sân nổi bật' })
    @ApiSuccessResponse()
    async toggleFeatured(@Param('id') id: string) {
        return this.venuesService.toggleFeatured(id);
    }
    @Delete(':id')
    @ApiOperation({ summary: 'Xóa sân' })
    @ApiSuccessResponse()
    async remove(@Param('id') id: string) {
        return this.venuesService.softDelete(id);
    }
}
