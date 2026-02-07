import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';

@Module({
    imports: [],
    providers: [ContentService],
    controllers: [ContentController],
    exports: [ContentService],
})
export class ContentModule { }
