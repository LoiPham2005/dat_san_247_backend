import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { StorageService } from '../../shared/storage/storage.service';

@Injectable()
export class UploadsService {
    constructor(
        @InjectRepository(File)
        private readonly fileRepository: Repository<File>,
        private readonly storageService: StorageService,
    ) { }

    /**
     * Delete a file from both database and storage
     * @param fileId UUID of the file
     */
    async deleteFile(fileId: string): Promise<void> {
        const file = await this.fileRepository.findOne({ where: { id: fileId } });

        if (!file) {
            throw new NotFoundException(`File with ID ${fileId} not found`);
        }

        // 1. Delete from physical storage (R2/S3/Local)
        // Use r2Key or publicUrl depending on storage service implementation
        await this.storageService.deleteFile(file.r2Key || file.publicUrl);

        // 2. Delete from database
        await this.fileRepository.remove(file);
    }

    /**
     * Delete multiple files at once
     * @param fileIds Array of file UUIDs
     */
    async deleteManyFiles(fileIds: string[]): Promise<void> {
        if (!fileIds || fileIds.length === 0) return;

        const files = await this.fileRepository.findByIds(fileIds);

        for (const file of files) {
            try {
                await this.storageService.deleteFile(file.r2Key || file.publicUrl);
            } catch (error) {
                // Log error but continue deleting other files
                console.error(`Failed to delete physical file for ID ${file.id}:`, error);
            }
        }

        if (files.length > 0) {
            await this.fileRepository.remove(files);
        }
    }
}
