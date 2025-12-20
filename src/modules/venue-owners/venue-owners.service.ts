// modules/venue-owners/venue-owners.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VenueOwner, VerificationStatus } from './entities/venue-owner.entity';

@Injectable()
export class VenueOwnersService {
  constructor(
    @InjectRepository(VenueOwner)
    private venueOwnerRepository: Repository<VenueOwner>,
  ) {}

  async findByUserId(userId: string): Promise<VenueOwner> {
    const owner = await this.venueOwnerRepository.findOne({
      where: { userId },
      relations: ['user', 'venues'],
    });

    if (!owner) {
      throw new NotFoundException('Venue owner profile not found');
    }

    return owner;
  }

  async create(userId: string, data: Partial<VenueOwner>): Promise<VenueOwner> {
    const owner = this.venueOwnerRepository.create({
      ...data,
      userId,
      verificationStatus: VerificationStatus.PENDING,
    });

    return this.venueOwnerRepository.save(owner);
  }

  async verify(ownerId: string, verifiedBy: string): Promise<VenueOwner> {
    const owner = await this.venueOwnerRepository.findOne({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new NotFoundException('Venue owner not found');
    }

    owner.verificationStatus = VerificationStatus.APPROVED;
    owner.verifiedAt = new Date();
    owner.verifiedBy = verifiedBy;

    return this.venueOwnerRepository.save(owner);
  }
}