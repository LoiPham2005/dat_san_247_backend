import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CustomerController } from './controllers/customer.controller';
import { OwnerController } from './controllers/owner.controller';
import { AdminController } from './controllers/admin.controller';

@Module({
    controllers: [CustomerController, OwnerController, AdminController],
    providers: [ReviewsService],
    exports: [ReviewsService],
})
export class ReviewsModule { }
