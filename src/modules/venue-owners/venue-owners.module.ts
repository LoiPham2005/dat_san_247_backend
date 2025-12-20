// =====================================================
// VENUE OWNERS MODULE
// =====================================================

// modules/venue-owners/venue-owners.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VenueOwnersController } from './venue-owners.controller';
import { VenueOwnersService } from './venue-owners.service';
import { VenueOwner } from './entities/venue-owner.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VenueOwner, User])],
  controllers: [VenueOwnersController],
  providers: [VenueOwnersService],
  exports: [VenueOwnersService],
})
export class VenueOwnersModule {}