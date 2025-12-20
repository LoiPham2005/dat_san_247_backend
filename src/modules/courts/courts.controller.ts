// modules/courts/courts.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CourtsService } from './courts.service';
import { CreateCourtDto, UpdateCourtDto } from './dto/create-court.dto';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Courts')
@Controller('courts')
export class CourtsController {
  constructor(private courtsService: CourtsService) {}

  @Get('venue/:venueId')
  @Public()
  @ApiOperation({ summary: 'Get courts by venue' })
  async getByVenue(@Param('venueId') venueId: string) {
    return this.courtsService.findByVenue(venueId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get court by ID' })
  async findOne(@Param('id') id: string) {
    return this.courtsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENUE_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new court' })
  async create(
    @CurrentUser('id') ownerId: string,
    @Body() createCourtDto: CreateCourtDto,
  ) {
    return this.courtsService.create(ownerId, createCourtDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENUE_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update court' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') ownerId: string,
    @Body() updateCourtDto: UpdateCourtDto,
  ) {
    return this.courtsService.update(id, ownerId, updateCourtDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENUE_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete court' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('id') ownerId: string,
  ) {
    await this.courtsService.delete(id, ownerId);
    return { message: 'Court deleted successfully' };
  }

  // Pricing Rules
  @Post('pricing-rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENUE_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create pricing rule' })
  async createPricingRule(@Body() createPricingRuleDto: CreatePricingRuleDto) {
    return this.courtsService.createPricingRule(createPricingRuleDto);
  }

  @Get(':courtId/pricing-rules')
  @Public()
  @ApiOperation({ summary: 'Get pricing rules for court' })
  async getPricingRules(@Param('courtId') courtId: string) {
    return this.courtsService.getPricingRules(courtId);
  }
}