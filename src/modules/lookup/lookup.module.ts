import { Module } from '@nestjs/common';
import { LookupService } from './lookup.service';
import { LookupController } from './lookup.controller';
import { PublicLookupController } from './public-lookup.controller';

@Module({
    providers: [LookupService],
    controllers: [LookupController, PublicLookupController],
    exports: [LookupService]
})
export class LookupModule {}
