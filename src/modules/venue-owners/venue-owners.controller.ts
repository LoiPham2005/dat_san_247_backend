// modules/venue-owners/venue-owners.controller.ts
import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VenueOwnersService } from './venue-owners.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { VenueOwner } from './entities/venue-owner.entity';

@ApiTags('Venue Owners')
@Controller('venue-owners')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VenueOwnersController {
  constructor(private venueOwnersService: VenueOwnersService) { }

  @Get('me')
  @UseGuards(RolesGuard)
  @Roles(UserRole.VENUE_OWNER)
  @ApiOperation({ summary: 'Get my venue owner profile' })
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.venueOwnersService.findByUserId(userId);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register as venue owner' })
  async register(
    @CurrentUser('id') userId: string,
    @Body() data: Partial<VenueOwner>,
  ) {
    return this.venueOwnersService.create(userId, data);
  }

  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Verify venue owner (Admin only)' })
  async verify(
    @Param('id') ownerId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.venueOwnersService.verify(ownerId, adminId);
  }
}