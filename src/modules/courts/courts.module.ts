import { Module, forwardRef } from '@nestjs/common';
import { CourtsService } from './courts.service';
import { CourtsController } from './courts.controller';
import { StorageModule } from '../../shared/storage/storage.module';

import { VenuesModule } from '../venues/venues.module';
import { OwnerCourtsController } from './owner-courts.controller';

@Module({
  imports: [
    forwardRef(() => VenuesModule),
    StorageModule,
  ],
  controllers: [CourtsController, OwnerCourtsController],
  providers: [CourtsService],
  exports: [CourtsService],
})
export class CourtsModule { }
