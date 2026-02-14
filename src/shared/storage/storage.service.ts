// import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { createClient, SupabaseClient } from '@supabase/supabase-js';
// import * as AWS from 'aws-sdk';
// import * as fs from 'fs';
// import * as path from 'path';

// @Injectable()
// export class StorageService implements OnModuleInit {
//     private s3: AWS.S3;
//     private supabase: SupabaseClient;
//     private readonly logger = new Logger(StorageService.name);

//     constructor(private configService: ConfigService) { }

//     onModuleInit() {
//         const driver = this.configService.get<string>('storage.driver');

//         if (driver === 'r2' || driver === 's3') {
//             this.s3 = new AWS.S3({
//                 endpoint: this.configService.get<string>('storage.r2.endpoint'),
//                 accessKeyId: this.configService.get<string>('storage.r2.accessKeyId'),
//                 secretAccessKey: this.configService.get<string>('storage.r2.secretAccessKey'),
//                 signatureVersion: 'v4',
//                 s3ForcePathStyle: true,
//             });
//         }

//         if (driver === 'supabase') {
//             const url = this.configService.get<string>('storage.supabase.url');
//             const key = this.configService.get<string>('storage.supabase.key');
//             if (url && key) {
//                 this.supabase = createClient(url, key);
//             } else {
//                 this.logger.warn('Supabase URL or Key missing in configuration');
//             }
//         }
//     }

//     async uploadFile(file: any, folder: string = 'uploads'): Promise<string> {
//         const driver = this.configService.get<string>('storage.driver');

//         switch (driver) {
//             case 'supabase':
//                 return this.uploadToSupabase(file, folder);
//             case 'r2':
//             case 's3':
//                 return this.uploadToCloud(file, folder);
//             default:
//                 return this.uploadToLocal(file, folder);
//         }
//     }

//     private async uploadToSupabase(file: any, folder: string): Promise<string> {
//         if (!this.supabase) {
//             throw new Error('Supabase client not initialized');
//         }

//         const bucket = this.configService.get<string>('storage.supabase.bucket') || 'dat_san_247';
//         const key = `${folder}/${Date.now()}-${file.originalname}`;

//         try {
//             const { data, error } = await this.supabase.storage
//                 .from(bucket)
//                 .upload(key, file.buffer, {
//                     contentType: file.mimetype,
//                     upsert: false,
//                 });

//             if (error) throw error;

//             const { data: publicUrlData } = this.supabase.storage
//                 .from(bucket)
//                 .getPublicUrl(key);

//             return publicUrlData.publicUrl;
//         } catch (error) {
//             this.logger.error('Supabase Upload Error:', error);
//             throw error;
//         }
//     }

//     private async uploadToCloud(file: any, folder: string): Promise<string> {
//         const bucket = this.configService.get<string>('storage.r2.bucket');
//         const key = `${folder}/${Date.now()}-${file.originalname}`;

//         try {
//             await this.s3.upload({
//                 Bucket: bucket as string,
//                 Key: key,
//                 Body: file.buffer,
//                 ContentType: file.mimetype,
//             }).promise();

//             const publicUrl = this.configService.get<string>('storage.r2.publicUrl');
//             return `${publicUrl}/${key}`;
//         } catch (error) {
//             this.logger.error('R2 Upload Error:', error);
//             throw error;
//         }
//     }

//     private async uploadToLocal(file: any, folder: string): Promise<string> {
//         const uploadPath = this.configService.get<string>('storage.local.path') || 'uploads';
//         const targetDir = path.join(process.cwd(), uploadPath, folder);

//         if (!fs.existsSync(targetDir)) {
//             fs.mkdirSync(targetDir, { recursive: true });
//         }

//         const fileName = `${Date.now()}-${file.originalname}`;
//         const filePath = path.join(targetDir, fileName);

//         fs.writeFileSync(filePath, file.buffer);

//         const appUrl = this.configService.get<string>('app.url') || 'http://localhost:3000';
//         return `${appUrl}/${uploadPath}/${folder}/${fileName}`;
//     }

//     async deleteFile(keyOrUrl: string): Promise<void> {
//         const driver = this.configService.get<string>('storage.driver');

//         if (driver === 'supabase') {
//             if (!this.supabase) return;
//             const bucket = this.configService.get<string>('storage.supabase.bucket') || 'dat_san_247';
//             // Extract key from URL if full URL is passed
//             const key = this.extractKeyFromUrl(keyOrUrl, 'supabase');
//             await this.supabase.storage.from(bucket).remove([key]);
//             return;
//         }

//         if (driver === 'r2' || driver === 's3') {
//             const key = this.extractKeyFromUrl(keyOrUrl, 'r2');
//             await this.s3.deleteObject({
//                 Bucket: this.configService.get<string>('storage.r2.bucket') as string,
//                 Key: key,
//             }).promise();
//             return;
//         }

//         // Local
//         const uploadPath = this.configService.get<string>('storage.local.path') || 'uploads';
//         const key = this.extractKeyFromUrl(keyOrUrl, 'local');
//         const filePath = path.join(process.cwd(), uploadPath, key);
//         if (fs.existsSync(filePath)) {
//             fs.unlinkSync(filePath);
//         }
//     }

//     private extractKeyFromUrl(url: string, driver: string): string {
//         if (!url.startsWith('http')) return url; // Already a key

//         try {
//             if (driver === 'supabase') {
//                 // Supabase URLs usually look like: https://xxx.supabase.co/storage/v1/object/public/bucket/folder/file.jpg
//                 const parts = url.split('/public/');
//                 if (parts.length > 1) {
//                     const bucketAndKey = parts[1];
//                     const firstSlashIndex = bucketAndKey.indexOf('/');
//                     return bucketAndKey.substring(firstSlashIndex + 1);
//                 }
//             }

//             if (driver === 'r2') {
//                 const publicUrl = this.configService.get<string>('storage.r2.publicUrl');
//                 if (publicUrl && url.startsWith(publicUrl)) {
//                     return url.replace(`${publicUrl}/`, '');
//                 }
//             }

//             // Fallback: try to guess or just return as is
//             const urlObj = new URL(url);
//             return urlObj.pathname.substring(1);
//         } catch (e) {
//             return url;
//         }
//     }
// }








import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService implements OnModuleInit {
    private s3: S3Client;
    private supabase: SupabaseClient;
    private readonly logger = new Logger(StorageService.name);

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        const driver = this.configService.get<string>('storage.driver');

        if (driver === 'r2' || driver === 's3') {
            this.s3 = new S3Client({
                region: 'auto', // Required for R2
                endpoint: this.configService.get<string>('storage.r2.endpoint'),
                credentials: {
                    accessKeyId: this.configService.get<string>('storage.r2.accessKeyId') as string,
                    secretAccessKey: this.configService.get<string>('storage.r2.secretAccessKey') as string,
                },
                forcePathStyle: true,
            });
        }

        if (driver === 'supabase') {
            const url = this.configService.get<string>('storage.supabase.url');
            const key = this.configService.get<string>('storage.supabase.key');
            if (url && key) {
                this.supabase = createClient(url, key);
            } else {
                this.logger.warn('Supabase URL or Key missing in configuration');
            }
        }
    }

    async uploadFile(file: any, folder: string = 'uploads'): Promise<string> {
        const driver = this.configService.get<string>('storage.driver');

        switch (driver) {
            case 'supabase':
                return this.uploadToSupabase(file, folder);
            case 'r2':
            case 's3':
                return this.uploadToCloud(file, folder);
            default:
                return this.uploadToLocal(file, folder);
        }
    }

    private async uploadToSupabase(file: any, folder: string): Promise<string> {
        if (!this.supabase) {
            throw new Error('Supabase client not initialized');
        }

        const bucket = this.configService.get<string>('storage.supabase.bucket') || 'dat_san_247';
        const key = `${folder}/${Date.now()}-${file.originalname}`;

        try {
            const { data, error } = await this.supabase.storage
                .from(bucket)
                .upload(key, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false,
                });

            if (error) throw error;

            const { data: publicUrlData } = this.supabase.storage
                .from(bucket)
                .getPublicUrl(key);

            return publicUrlData.publicUrl;
        } catch (error) {
            this.logger.error('Supabase Upload Error:', error);
            throw error;
        }
    }

    private async uploadToCloud(file: any, folder: string): Promise<string> {
        const bucket = this.configService.get<string>('storage.r2.bucket');
        const key = `${folder}/${Date.now()}-${file.originalname}`;

        try {
            const command = new PutObjectCommand({
                Bucket: bucket as string,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            });

            await this.s3.send(command);

            const publicUrl = this.configService.get<string>('storage.r2.publicUrl');
            return `${publicUrl}/${key}`;
        } catch (error) {
            this.logger.error('Cloud Storage Upload Error:', error);
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

    async deleteFile(keyOrUrl: string): Promise<void> {
        const driver = this.configService.get<string>('storage.driver');

        if (driver === 'supabase') {
            if (!this.supabase) return;
            const bucket = this.configService.get<string>('storage.supabase.bucket') || 'dat_san_247';
            // Extract key from URL if full URL is passed
            const key = this.extractKeyFromUrl(keyOrUrl, 'supabase');
            await this.supabase.storage.from(bucket).remove([key]);
            return;
        }

        if (driver === 'r2' || driver === 's3') {
            const key = this.extractKeyFromUrl(keyOrUrl, 'r2');
            const command = new DeleteObjectCommand({
                Bucket: this.configService.get<string>('storage.r2.bucket') as string,
                Key: key,
            });
            await this.s3.send(command);
            return;
        }

        // Local
        const uploadPath = this.configService.get<string>('storage.local.path') || 'uploads';
        const key = this.extractKeyFromUrl(keyOrUrl, 'local');
        const filePath = path.join(process.cwd(), uploadPath, key);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    private extractKeyFromUrl(url: string, driver: string): string {
        if (!url.startsWith('http')) return url; // Already a key

        try {
            if (driver === 'supabase') {
                // Supabase URLs usually look like: https://xxx.supabase.co/storage/v1/object/public/bucket/folder/file.jpg
                const parts = url.split('/public/');
                if (parts.length > 1) {
                    const bucketAndKey = parts[1];
                    const firstSlashIndex = bucketAndKey.indexOf('/');
                    return bucketAndKey.substring(firstSlashIndex + 1);
                }
            }

            if (driver === 'r2') {
                const publicUrl = this.configService.get<string>('storage.r2.publicUrl');
                if (publicUrl && url.startsWith(publicUrl)) {
                    return url.replace(`${publicUrl}/`, '');
                }
            }

            if (driver === 'local') {
                const uploadPath = this.configService.get<string>('storage.local.path') || 'uploads';
                const urlObj = new URL(url);
                let pathname = urlObj.pathname;
                if (pathname.startsWith('/')) pathname = pathname.substring(1);

                // If pathname starts with uploadPath, strip it to avoid duplication in deleteFile
                if (pathname.startsWith(uploadPath)) {
                    let key = pathname.substring(uploadPath.length);
                    if (key.startsWith('/')) key = key.substring(1);
                    return key;
                }
            }

            // Fallback: try to guess or just return as is
            const urlObj = new URL(url);
            return urlObj.pathname.substring(1);
        } catch (e) {
            return url;
        }
    }
}
