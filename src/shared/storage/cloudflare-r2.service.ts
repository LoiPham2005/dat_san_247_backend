import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudflareR2Service {
    constructor(private configService: ConfigService) { }

    async uploadFile(file: any): Promise<string> {
        // Implementation for Cloudflare R2 upload
        return 'url';
    }

    async deleteFile(key: string): Promise<void> {
        // Implementation for Cloudflare R2 delete
    }
}
