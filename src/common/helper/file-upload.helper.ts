// src/common/helper/file-upload.helper.ts
import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';
@Injectable()
export class FileUploadHelper {
  constructor(private cloudinary: CloudinaryService) {}

  /** Upload ảnh mới và xóa ảnh cũ nếu có */
  async replaceFile(
    file: Express.Multer.File,
    folder: string,
    oldId?: string
  ): Promise<{ media: string; cloudinaryId: string } | null> {
    if (!file) return null;
    if (oldId) await this.cloudinary.deleteFile(oldId);

    const upload = await this.cloudinary.uploadFile(file, {
      folder,
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
      ],
    });

    return { media: upload.secure_url, cloudinaryId: upload.public_id };
  }

  /** Xóa file Cloudinary */
  async deleteFile(cloudinaryId: string) {
    return this.cloudinary.deleteFile(cloudinaryId);
  }
}
