import { Module, Global } from '@nestjs/common';
import { StorageService } from './cloudflare-r2.service';

@Global()
@Module({
    providers: [StorageService],
    exports: [StorageService],
})
export class StorageModule { }
