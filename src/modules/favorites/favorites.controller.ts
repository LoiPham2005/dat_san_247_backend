// modules/favorites/favorites.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Get my favorite venues' })
  async getMyFavorites(@CurrentUser('id') userId: string) {
    return this.favoritesService.getUserFavorites(userId);
  }

  @Post(':venueId')
  @ApiOperation({ summary: 'Add venue to favorites' })
  async addFavorite(
    @CurrentUser('id') userId: string,
    @Param('venueId') venueId: string,
  ) {
    return this.favoritesService.addFavorite(userId, venueId);
  }

  @Delete(':venueId')
  @ApiOperation({ summary: 'Remove venue from favorites' })
  async removeFavorite(
    @CurrentUser('id') userId: string,
    @Param('venueId') venueId: string,
  ) {
    await this.favoritesService.removeFavorite(userId, venueId);
    return { message: 'Removed from favorites' };
  }

  @Get('check/:venueId')
  @ApiOperation({ summary: 'Check if venue is favorited' })
  async checkFavorite(
    @CurrentUser('id') userId: string,
    @Param('venueId') venueId: string,
  ) {
    const isFavorite = await this.favoritesService.isFavorite(userId, venueId);
    return { isFavorite };
  }
}