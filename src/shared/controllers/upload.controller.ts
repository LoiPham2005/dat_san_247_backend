// shared/controllers/upload.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UploadService } from '../services/upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: 'Upload single image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadService.uploadFile(file, 'images');
    return { url };
  }

  @Post('images')
  @ApiOperation({ summary: 'Upload multiple images' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = await this.uploadService.uploadMultiple(files, 'images');
    return { urls };
  }
}