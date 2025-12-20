// shared/services/upload.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<string> {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP are allowed',
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    const key = `${folder}/${uuidv4()}-${file.originalname}`;

    const params: S3.PutObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    try {
      await this.s3.upload(params).promise();
      return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      throw new BadRequestException('Failed to upload file');
    }
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    folder: string = 'general',
  ): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const key = fileUrl.split('.com/')[1];

    const params: S3.DeleteObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (error) {
      throw new BadRequestException('Failed to delete file');
    }
  }
}
