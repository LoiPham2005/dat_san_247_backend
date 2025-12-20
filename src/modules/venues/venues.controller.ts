// modules/venues/venues.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SearchVenueDto } from './dto/search-venue.dto';

@ApiTags('Venues')
@Controller('venues')
export class VenuesController {
  constructor(private venuesService: VenuesService) {}

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search venues with filters' })
  async search(@Query() searchDto: SearchVenueDto) {
    return this.venuesService.search(searchDto);
  }

  @Get('my-venues')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENUE_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get owner venues' })
  async getMyVenues(@CurrentUser('id') ownerId: string) {
    return this.venuesService.getOwnerVenues(ownerId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENUE_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new venue' })
  async create(
    @CurrentUser('id') ownerId: string,
    @Body() createVenueDto: CreateVenueDto,
  ) {
    return this.venuesService.create(ownerId, createVenueDto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get venue by ID' })
  async findOne(@Param('id') id: string) {
    return this.venuesService.findOne(id);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get venue by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.venuesService.findBySlug(slug);
  }
}