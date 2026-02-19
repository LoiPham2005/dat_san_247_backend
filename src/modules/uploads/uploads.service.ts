import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../shared/storage/storage.service';

@Injectable()
export class UploadsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
    ) { }

    async deleteFile(fileId: string): Promise<void> {
        const file = await this.prisma.files.findUnique({ where: { id: fileId } });

        if (!file) {
            throw new NotFoundException(`File with ID ${fileId} not found`);
        }

        // Use file_path or public_url
        const path = (file as any).file_path || (file as any).r2_key || file.public_url;
        await this.storageService.deleteFile(path);

        await this.prisma.files.delete({ where: { id: fileId } });
    }

    async deleteManyFiles(fileIds: string[]): Promise<void> {
        if (!fileIds || fileIds.length === 0) return;

        const files = await this.prisma.files.findMany({ where: { id: { in: fileIds } } });

        for (const file of files) {
            try {
                const path = (file as any).file_path || (file as any).r2_key || file.public_url;
                await this.storageService.deleteFile(path);
            } catch (error) {
                console.error(`Failed to delete physical file for ID ${file.id}:`, error);
            }
        }

        if (files.length > 0) {
            await this.prisma.files.deleteMany({ where: { id: { in: fileIds } } });
        }
    }
}
