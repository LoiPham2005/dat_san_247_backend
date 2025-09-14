import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { FileValidator } from '../../common/helper/file-validator.helper';

@Controller('banners')
export class BannerController {
  constructor(
    private readonly bannerService: BannerService
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('media'))
  async create(
    @Body() createBannerDto: CreateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const validation = FileValidator.validate(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'],
      allowedVideoTypes: ['video/mp4', 'video/mpeg', 'video/quicktime']
    });

    if (!validation.isValid) {
      throw new BadRequestException(validation.error);
    }

    return this.bannerService.create(createBannerDto, file);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('media'))
  async update(
    @Param('id') id: number,
    @Body() updateBannerDto: UpdateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      const validation = FileValidator.validate(file, {
        maxSize: 10 * 1024 * 1024,
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'],
        allowedVideoTypes: ['video/mp4', 'video/mpeg', 'video/quicktime']
      });

      if (!validation.isValid) {
        throw new BadRequestException(validation.error);
      }
    }

    return this.bannerService.update(id, updateBannerDto, file);
  }

  @Get()
  findAll() {
    return this.bannerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.bannerService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.bannerService.remove(id);
  }
}
