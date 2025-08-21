import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { success } from 'src/common/helper/response.helper';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite)
        private readonly favoriteRepo: Repository<Favorite>,
    ) { }

    async create(createDto: CreateFavoriteDto) {
        const favorite = this.favoriteRepo.create(createDto);
        const saved = await this.favoriteRepo.save(favorite);
        return success(saved, 'Thêm yêu thích thành công');
    }

    async findAll() {
        const favorites = await this.favoriteRepo.find({
            relations: ['user', 'venue'],
        });
        return success(favorites, 'Lấy danh sách yêu thích thành công');
    }

    async findByUser(userId: number) {
        const favorites = await this.favoriteRepo.find({
            where: { userId },
            relations: ['venue'],
        });
        return success(favorites, 'Lấy danh sách yêu thích theo người dùng thành công');
    }

    async remove(userId: number, venueId: number) {
        const result = await this.favoriteRepo.delete({ userId, venueId });
        return success(result, 'Xóa yêu thích thành công');
    }
}
