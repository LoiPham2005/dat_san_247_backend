import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportCategoriesService } from './sport-categories.service';
import { SportCategoriesController } from './sport-categories.controller';
import { SportCategory } from './entities/sport-category.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { FileUploadHelper } from 'src/common/helper/file-upload.helper';
import { EntityHelper } from 'src/common/helper/entity.helper';
import { SharedModule } from 'src/common/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SportCategory]),
    SharedModule, // Thêm module này
  ],
  controllers: [SportCategoriesController],
  providers: [SportCategoriesService],
})
export class SportCategoriesModule {}
