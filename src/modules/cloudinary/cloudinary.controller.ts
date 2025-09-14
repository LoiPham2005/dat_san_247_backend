import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { FileValidator } from '../../common/helper/file-validator.helper';

@Controller('upload')
export class CloudinaryController {
  constructor(private cloudinaryService: CloudinaryService) {}

  @Post('media')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(@UploadedFile() file: Express.Multer.File) {
    const validation = FileValidator.validate(file);
    if (!validation.isValid) {
      throw new BadRequestException(validation.error);
    }

    try {
      const result = await this.cloudinaryService.uploadFile(file, 'uploads');
      return {
        message: 'Upload thành công!',
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        type: file.mimetype.startsWith('image/') ? 'image' : 'video'
      };
    } catch (error) {
      throw new BadRequestException('Upload thất bại: ' + error.message);
    }
  }
}