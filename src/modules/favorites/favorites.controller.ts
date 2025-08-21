import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  create(@Body() createDto: CreateFavoriteDto) {
    return this.favoritesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.favoritesService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: number) {
    return this.favoritesService.findByUser(userId);
  }

  @Delete(':userId/:venueId')
  remove(@Param('userId') userId: number, @Param('venueId') venueId: number) {
    return this.favoritesService.remove(userId, venueId);
  }
}
