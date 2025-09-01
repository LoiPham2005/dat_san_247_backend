import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {

    @Post('media')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + extname(file.originalname));
            },
        }),
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB
        },
        fileFilter: (req, file, cb) => {
            // Kiểm tra mime type cho ảnh và video
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/) &&
                !file.mimetype.match(/^video\/(mp4|mpeg|quicktime)$/)) {
                return cb(new BadRequestException('Chỉ chấp nhận file ảnh hoặc video!'), false);
            }
            cb(null, true);
        },
    }))
    uploadMedia(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Không có file nào được upload!');
        }

        return {
            message: 'Upload thành công!',
            filename: file.filename,
            path: file.path,
            type: file.mimetype.startsWith('image/') ? 'image' : 'video'
        };
    }
}
