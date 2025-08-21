import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportCategoriesService } from './sport-categories.service';
import { SportCategoriesController } from './sport-categories.controller';
import { SportCategory } from './entities/sport-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SportCategory])],
  controllers: [SportCategoriesController],
  providers: [SportCategoriesService],
  exports: [SportCategoriesService],
})
export class SportCategoriesModule {}
