import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { VenuesService } from './venues.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { VenueFilterDto } from './dto/venue-filter.dto';
import { CreateVenueDto, UpdateVenueDto } from './dto/create-venue.dto';
import { ApiSuccessResponse, ApiPaginatedResponse } from '../../common/decorators/api-response.decorator';


@ApiTags('Owner - Venues')
@ApiBearerAuth()
@Roles(UserRole.OWNER)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('owner/venues')
export class OwnerVenuesController {
    constructor(private readonly venuesService: VenuesService) { }

    @Get()
    @ApiOperation({ summary: 'Danh sách sân của chủ sở hữu' })
    @ApiPaginatedResponse(Object)
    async findAll(@CurrentUser('id') ownerId: string, @Query() filter: VenueFilterDto) {
        return this.venuesService.findAllByOwner(ownerId, filter);
    }

    @Post()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'images', maxCount: 10 },
    ]))
    @ApiOperation({ summary: 'Thêm sân mới' })
    @ApiSuccessResponse(Object)
    async create(
        @CurrentUser('id') ownerId: string,
        @Body() data: CreateVenueDto,
        @UploadedFiles() files: { thumbnail?: Express.Multer.File[], images?: Express.Multer.File[] }
    ) {
        return this.venuesService.createOwnerVenue(ownerId, data, {
            thumbnail: files.thumbnail?.[0],
            images: files.images
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Chi tiết sân của chủ' })
    @ApiSuccessResponse(Object)
    async findOne(@CurrentUser('id') ownerId: string, @Param('id') id: string) {
        return this.venuesService.findOneByOwner(ownerId, id);
    }

    @Put(':id')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'images', maxCount: 10 },
    ]))
    @ApiOperation({ summary: 'Cập nhật thông tin sân' })
    @ApiSuccessResponse()
    async update(
        @CurrentUser('id') ownerId: string,
        @Param('id') id: string,
        @Body() data: UpdateVenueDto,
        @UploadedFiles() files: { thumbnail?: Express.Multer.File[], images?: Express.Multer.File[] }
    ) {
        return this.venuesService.updateByOwner(ownerId, id, data, {
            thumbnail: files.thumbnail?.[0],
            images: files.images
        });
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa sân' })
    @ApiSuccessResponse()
    async remove(@CurrentUser('id') ownerId: string, @Param('id') id: string) {
        return this.venuesService.softDeleteByOwner(ownerId, id);
    }
}
