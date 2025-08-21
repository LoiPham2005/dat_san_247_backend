import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepo: Repository<Favorite>,
  ) {}

  create(createDto: CreateFavoriteDto) {
    const favorite = this.favoriteRepo.create(createDto);
    return this.favoriteRepo.save(favorite);
  }

  findAll() {
    return this.favoriteRepo.find({ relations: ['user', 'venue'] });
  }

  findByUser(userId: number) {
    return this.favoriteRepo.find({ where: { userId }, relations: ['venue'] });
  }

  remove(userId: number, venueId: number) {
    return this.favoriteRepo.delete({ userId, venueId });
  }
}
