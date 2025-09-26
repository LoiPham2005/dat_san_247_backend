import { CloudinaryResponse } from './interfaces/cloudinary-response.interface';
import { Inject, Injectable } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private cloudinary: typeof Cloudinary) {}

  uploadFile(file: Express.Multer.File, options: any = {}): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadOptions = { ...options, resource_type: 'auto', unique_filename: true };

      const uploadStream = this.cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) return reject(error);
        resolve(result as CloudinaryResponse);
      });

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<boolean> {
    const result = await this.cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  }
}
