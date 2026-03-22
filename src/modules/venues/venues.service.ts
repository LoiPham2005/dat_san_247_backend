import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { slugify } from '../../common/utils/slug.util';

@Injectable()
export class VenuesService {
    constructor(private prisma: PrismaService) { }

    private async _verifyVenueAccess(userId: string, venueId: string) {
        let finalVenueId = venueId;
        
        // Handle Mock VN-1
        if (venueId === 'VN-1') {
            const staffRecord = await this.prisma.venue_staff.findFirst({
                where: { user_id: userId, is_active: true }
            });
            if (staffRecord) {
                finalVenueId = staffRecord.venue_id;
            } else {
                 const ownedVenue = await this.prisma.venues.findFirst({
                    where: { owner_id: userId, deleted_at: null }
                });
                if (ownedVenue) {
                    finalVenueId = ownedVenue.id;
                } else {
                    throw new NotFoundException('Bạn không được gán cho bất kỳ cơ sở nào trong hệ thống.');
                }
            }
        }

        const venue = await this.prisma.venues.findFirst({
            where: { id: finalVenueId, deleted_at: null }
        });

        if (!venue) throw new NotFoundException('Không tìm thấy cơ sở');

        if (venue.owner_id !== userId) {
            const isStaff = await this.prisma.venue_staff.findFirst({
                where: { venue_id: finalVenueId, user_id: userId, is_active: true }
            });
            if (!isStaff) {
                throw new ForbiddenException('Bạn không có quyền truy cập cơ sở này');
            }
        }

        return { ...venue, id: finalVenueId };
    }

    async getVenueDetail(venueId: string, userId: string) {
        return this._verifyVenueAccess(userId, venueId);
    }

    async getMyVenues(ownerId: string) {
        return this.prisma.venues.findMany({
            where: { owner_id: ownerId, deleted_at: null },
            orderBy: { created_at: 'desc' },
        });
    }

    async createVenue(ownerId: string, dto: CreateVenueDto) {
        const slug = await this.generateUniqueSlug(dto.name);
        return this.prisma.venues.create({
            data: {
                ...dto,
                city: dto.city || 'Hà Nội',
                district: dto.district || 'Hà Nội',
                owner_id: ownerId,
                slug: slug,
                status: 'PENDING',
            },
        });
    }

    async updateVenue(id: string, userId: string, dto: UpdateVenueDto) {
        const venue = await this._verifyVenueAccess(userId, id);

        const updateData: any = { ...dto };
        if (dto.name && dto.name !== venue.name) {
            updateData.slug = await this.generateUniqueSlug(dto.name);
        }

        return this.prisma.venues.update({
            where: { id: venue.id },
            data: updateData,
        });
    }

    async deleteVenue(id: string, userId: string) {
        const venue = await this._verifyVenueAccess(userId, id);

        return this.prisma.venues.update({
            where: { id: venue.id },
            data: { deleted_at: new Date() },
        });
    }

    async getVerification(venueId: string, userId: string) {
        const venue = await this._verifyVenueAccess(userId, venueId);

        return this.prisma.venue_verifications.findFirst({
            where: { venue_id: venue.id },
            orderBy: { created_at: 'desc' }
        });
    }

    async submitVerification(venueId: string, userId: string, dto: any) {
        const venue = await this._verifyVenueAccess(userId, venueId);

        return this.prisma.venue_verifications.create({
            data: {
                ...dto,
                venue_id: venue.id,
                status: 'PENDING'
            }
        });
    }

    async getOperatingHours(venueId: string, userId: string) {
        const venue = await this._verifyVenueAccess(userId, venueId);

        return this.prisma.venue_operating_hours.findMany({
            where: { venue_id: venue.id },
            orderBy: { day_of_week: 'asc' }
        });
    }

    async updateOperatingHours(venueId: string, userId: string, hours: any[]) {
        const venue = await this._verifyVenueAccess(userId, venueId);

        // Hàm helper để tạo Date object với giờ, phút, giây cụ thể
        const toDateWithTime = (timeStr: string) => {
            if (!timeStr) return new Date();
            const [hours, minutes, seconds] = timeStr.split(':');
            const d = new Date(1970, 0, 1, parseInt(hours), parseInt(minutes) || 0, parseInt(seconds) || 0);
            return d;
        };

        return this.prisma.$transaction(
            hours.map((h) =>
                this.prisma.venue_operating_hours.upsert({
                    where: {
                        venue_id_day_of_week: {
                            venue_id: venue.id,
                            day_of_week: h.day_of_week,
                        },
                    },
                    update: {
                        opening_time: toDateWithTime(h.opening_time),
                        closing_time: toDateWithTime(h.closing_time),
                        is_closed: h.is_closed,
                    },
                    create: {
                        venue_id: venue.id,
                        day_of_week: h.day_of_week,
                        opening_time: toDateWithTime(h.opening_time),
                        closing_time: toDateWithTime(h.closing_time),
                        is_closed: h.is_closed,
                    },
                }),
            ),
        );
    }

    private async generateUniqueSlug(name: string): Promise<string> {
        let slug = slugify(name);
        let count = 0;
        let finalSlug = slug;

        while (true) {
            const existing = await this.prisma.venues.findUnique({ where: { slug: finalSlug } });
            if (!existing) break;
            count++;
            finalSlug = `${slug}-${count}`;
        }
        return finalSlug;
    }
}
