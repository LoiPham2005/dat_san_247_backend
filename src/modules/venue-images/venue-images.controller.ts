import { Controller, Get, Post, Body, Param, Patch, Delete, UseInterceptors, UploadedFiles, BadRequestException, UploadedFile } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { VenueImagesService } from './venue-images.service';
import { CreateVenueImageDto } from './dto/create-venue-image.dto';
import { UpdateVenueImageDto } from './dto/update-venue-image.dto';
import { ImageType } from './entities/venue-image.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { success } from 'src/common/helper/response.helper';

@Controller('venue-images')
export class VenueImagesController {
  constructor(
    private readonly venueImagesService: VenueImagesService,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  @Post()
  @UseInterceptors(FileInterceptor('imageUrl'))
  async create(
    @Body() createDto: CreateVenueImageDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.venueImagesService.create(createDto, file);
  }


  @Get()
  findAll() {
    return this.venueImagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.venueImagesService.findOne(id);
  }

  @Get('venue/:venueId')
  findByVenue(@Param('venueId') venueId: number) {
    return this.venueImagesService.findByVenue(venueId);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('imageUrl'))
  update(
    @Param('id') id: number,
    @Body() dto: UpdateVenueImageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.venueImagesService.update(id, dto, file);
  }


  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.venueImagesService.remove(id);
  }
}
