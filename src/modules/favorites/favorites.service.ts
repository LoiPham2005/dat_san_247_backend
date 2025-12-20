// modules/favorites/favorites.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Venue } from '../venues/entities/venue.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    @InjectRepository(Venue)
    private venueRepository: Repository<Venue>,
  ) {}

  async addFavorite(userId: string, venueId: string): Promise<Favorite> {
    // Check if venue exists
    const venue = await this.venueRepository.findOne({
      where: { id: venueId },
    });

    if (!venue) {
      throw new NotFoundException('Venue not found');
    }

    // Check if already favorited
    const existing = await this.favoriteRepository.findOne({
      where: { userId, venueId },
    });

    if (existing) {
      throw new ConflictException('Venue already in favorites');
    }

    const favorite = this.favoriteRepository.create({ userId, venueId });
    return this.favoriteRepository.save(favorite);
  }

  async removeFavorite(userId: string, venueId: string): Promise<void> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, venueId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoriteRepository.delete(favorite.id);
  }

  async getUserFavorites(userId: string): Promise<Venue[]> {
    const favorites = await this.favoriteRepository.find({
      where: { userId },
      relations: ['venue'],
      order: { createdAt: 'DESC' },
    });

    return favorites.map((f) => f.venue);
  }

  async isFavorite(userId: string, venueId: string): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: { userId, venueId },
    });

    return !!favorite;
  }
}
