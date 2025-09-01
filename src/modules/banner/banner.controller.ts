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
  BadRequestException,
  Req
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  @UseInterceptors(FileInterceptor('media', {
    storage: diskStorage({
      destination: './uploads/banners',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/) &&
          !file.mimetype.match(/^video\/(mp4|mpeg|quicktime)$/)) {
        return cb(new BadRequestException('Chỉ chấp nhận file ảnh hoặc video!'), false);
      }
      cb(null, true);
    },
  }))
  async create(
    @Req() req,
    @Body() createBannerDto: CreateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      createBannerDto.mediaUrl = `${baseUrl}/uploads/banners/${file.filename}`;
    }
    return this.bannerService.create(createBannerDto);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('media', {
    storage: diskStorage({
      destination: './uploads/banners',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/) &&
          !file.mimetype.match(/^video\/(mp4|mpeg|quicktime)$/)) {
        return cb(new BadRequestException('Chỉ chấp nhận file ảnh hoặc video!'), false);
      }
      cb(null, true);
    },
  }))
  async update(
    @Req() req,
    @Param('id') id: number,
    @Body() updateBannerDto: UpdateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      updateBannerDto.mediaUrl = `${baseUrl}/uploads/banners/${file.filename}`;
    }
    return this.bannerService.update(id, updateBannerDto);
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
