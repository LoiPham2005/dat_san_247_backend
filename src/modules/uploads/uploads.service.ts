import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { File } from './entities/file.entity';
import { StorageService } from '../../shared/storage/storage.service';

@Injectable()
export class UploadsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
    ) { }

    /**
     * Delete a file from both database and storage
     * @param fileId UUID of the file
     */
    async deleteFile(fileId: string): Promise<void> {
        const file = await this.prisma.files.findUnique({ where: { id: fileId } });

        if (!file) {
            throw new NotFoundException(`File with ID ${fileId} not found`);
        }

        // 1. Delete from physical storage (R2/S3/Local)
        // Use r2_key or public_url depending on storage service implementation
        await this.storageService.deleteFile(file.r2_key || file.public_url);

        // 2. Delete from database
        await this.prisma.files.delete({ where: { id: fileId } });
    }

    /**
     * Delete multiple files at once
     * @param fileIds Array of file UUIDs
     */
    async deleteManyFiles(fileIds: string[]): Promise<void> {
        if (!fileIds || fileIds.length === 0) return;

        const files = await this.prisma.files.findMany({ where: { id: { in: fileIds } } });

        for (const file of files) {
            try {
                await this.storageService.deleteFile(file.r2_key || file.public_url);
            } catch (error) {
                // Log error but continue deleting other files
                console.error(`Failed to delete physical file for ID ${file.id}:`, error);
            }
        }

        if (files.length > 0) {
            await this.prisma.files.deleteMany({ where: { id: { in: fileIds } } });
        }
    }
}
