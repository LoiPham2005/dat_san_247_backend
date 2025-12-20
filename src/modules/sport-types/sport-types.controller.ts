// modules/sport-types/sport-types.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SportTypesService } from './sport-types.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SportType } from './entities/sport-type.entity';

@ApiTags('Sport Types')
@Controller('sport-types')
export class SportTypesController {
  constructor(private sportTypesService: SportTypesService) { }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all sport types' })
  async findAll() {
    return this.sportTypesService.findAll();
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get sport type by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.sportTypesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create sport type (Admin only)' })
  async create(@Body() data: Partial<SportType>) {
    return this.sportTypesService.create(data);
  }
}