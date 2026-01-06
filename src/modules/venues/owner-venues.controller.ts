import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VenuesService } from './venues.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { VenueFilterDto } from './dto/venue-filter.dto';
import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';
import { Venue } from './entities/venue.entity';

@ApiTags('Owner - Venues')
@ApiBearerAuth()
@Roles(UserRole.OWNER)
@UseGuards(RolesGuard)
@Controller('owner/venues')
export class OwnerVenuesController {
    constructor(private readonly venuesService: VenuesService) { }

    @Get()
    @ApiOperation({ summary: 'Danh sách sân của chủ sở hữu' })
    @ApiPaginatedResponse(Venue)
    async findAll(@CurrentUser('id') ownerId: string, @Query() filter: VenueFilterDto) {
        return this.venuesService.findAllByOwner(ownerId, filter);
    }

    @Post()
    @ApiOperation({ summary: 'Thêm sân mới' })
    @ApiSuccessResponse(Venue)
    async create(@CurrentUser('id') ownerId: string, @Body() data: any) {
        return this.venuesService.createOwnerVenue(ownerId, data);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Chi tiết sân của chủ' })
    @ApiSuccessResponse(Venue)
    async findOne(@CurrentUser('id') ownerId: string, @Param('id') id: string) {
        return this.venuesService.findOneByOwner(ownerId, id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật thông tin sân' })
    @ApiSuccessResponse()
    async update(@CurrentUser('id') ownerId: string, @Param('id') id: string, @Body() data: any) {
        return this.venuesService.updateByOwner(ownerId, id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa sân' })
    @ApiSuccessResponse()
    async remove(@CurrentUser('id') ownerId: string, @Param('id') id: string) {
        return this.venuesService.softDeleteByOwner(ownerId, id);
    }
}
