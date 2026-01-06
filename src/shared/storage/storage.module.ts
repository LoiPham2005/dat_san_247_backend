import { Module, Global } from '@nestjs/common';
import { CloudflareR2Service } from './cloudflare-r2.service';

@Global()
@Module({
    providers: [CloudflareR2Service],
    exports: [CloudflareR2Service],
})
export class StorageModule { }
