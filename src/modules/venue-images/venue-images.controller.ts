import { Controller, Get, Post, Body, Param, Patch, Delete, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { VenueImagesService } from './venue-images.service';
import { CreateVenueImageDto } from './dto/create-venue-image.dto';
import { UpdateVenueImageDto } from './dto/update-venue-image.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImageType } from './entities/venue-image.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { success } from 'src/common/helper/response.helper';

@Controller('venue-images')
export class VenueImagesController {
  constructor(
    private readonly venueImagesService: VenueImagesService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post('upload/:venueId')
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadImages(
    @Param('venueId') venueId: number,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Không có file nào được upload');
    }

    const imagePromises = files.map(async (file, index) => {
      const result = await this.cloudinaryService.uploadFile(file, 'venues');
      
      const createDto: CreateVenueImageDto = {
        venueId: venueId,
        imageUrl: result.secure_url,
        imageType: index === 0 ? ImageType.MAIN : ImageType.GALLERY,
        displayOrder: index
      };

      return this.venueImagesService.create(createDto);
    });

    const savedImages = await Promise.all(imagePromises);
    return success(savedImages, 'Upload ảnh venue thành công');
  }

  @Post()
  create(@Body() createDto: CreateVenueImageDto) {
    return this.venueImagesService.create(createDto);
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
  update(@Param('id') id: number, @Body() updateDto: UpdateVenueImageDto) {
    return this.venueImagesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.venueImagesService.remove(id);
  }
}
