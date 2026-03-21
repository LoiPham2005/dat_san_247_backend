import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CustomerController } from './controllers/customer.controller';
import { OwnerController } from './controllers/owner.controller';
import { StorageService } from '../../shared/storage/storage.service';

@Module({
    controllers: [CustomerController, OwnerController],
    providers: [ReviewsService, StorageService],
    exports: [ReviewsService],
})
export class ReviewsModule { }
