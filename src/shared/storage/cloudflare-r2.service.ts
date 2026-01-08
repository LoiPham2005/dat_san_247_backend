import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
    private s3: AWS.S3;
    private readonly logger = new Logger(StorageService.name);

    constructor(private configService: ConfigService) {
        const driver = this.configService.get<string>('storage.driver');
        if (driver === 'r2' || driver === 's3') {
            this.s3 = new AWS.S3({
                endpoint: this.configService.get<string>('storage.r2.endpoint') as string,
                accessKeyId: this.configService.get<string>('storage.r2.accessKeyId') as string,
                secretAccessKey: this.configService.get<string>('storage.r2.secretAccessKey') as string,
                signatureVersion: 'v4',
                s3ForcePathStyle: true,
            });
        }
    }

    async uploadFile(file: any, folder: string = 'uploads'): Promise<string> {
        const driver = this.configService.get<string>('storage.driver');

        if (driver === 'r2' || driver === 's3') {
            return this.uploadToCloud(file, folder);
        } else {
            return this.uploadToLocal(file, folder);
        }
    }

    private async uploadToCloud(file: any, folder: string): Promise<string> {
        const bucket = this.configService.get<string>('storage.r2.bucket');
        const key = `${folder}/${Date.now()}-${file.originalname}`;

        try {
            await this.s3.upload({
                Bucket: bucket as string,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }).promise();

            const publicUrl = this.configService.get<string>('storage.r2.publicUrl');
            return `${publicUrl}/${key}`;
        } catch (error) {
            this.logger.error('R2 Upload Error:', error);
            throw error;
        }
    }

    private async uploadToLocal(file: any, folder: string): Promise<string> {
        const uploadPath = this.configService.get<string>('storage.local.path') || 'uploads';
        const targetDir = path.join(process.cwd(), uploadPath, folder);

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(targetDir, fileName);

        fs.writeFileSync(filePath, file.buffer);

        const appUrl = this.configService.get<string>('app.url') || 'http://localhost:3000';
        return `${appUrl}/${uploadPath}/${folder}/${fileName}`;
    }

    async deleteFile(key: string): Promise<void> {
        const driver = this.configService.get<string>('storage.driver');
        if (driver === 'r2' || driver === 's3') {
            await this.s3.deleteObject({
                Bucket: this.configService.get<string>('storage.r2.bucket') as string,
                Key: key,
            }).promise();
        } else {
            // Delete local file implementation
            const uploadPath = this.configService.get<string>('storage.local.path') || 'uploads';
            const filePath = path.join(process.cwd(), uploadPath, key);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }
}
