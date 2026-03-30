import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { slugify } from '../../common/utils/slug.util';
import { v4 as uuid } from 'uuid';

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
            where: { id: finalVenueId, deleted_at: null },
            include: { sport_assignments: true }
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
            include: { sport_assignments: true },
            orderBy: { created_at: 'desc' },
        });
    }

    async createVenue(ownerId: string, dto: CreateVenueDto) {
        const { sport_types, ...rest } = dto;
        const slug = await this.generateUniqueSlug(dto.name);
        return this.prisma.venues.create({
            data: {
                ...rest,
                city: dto.city || 'Hà Nội',
                district: dto.district || 'Hà Nội',
                owner_id: ownerId,
                slug: slug,
                status: 'PENDING',
                sport_assignments: sport_types ? {
                    create: sport_types.map(s => ({ sport_type: s }))
                } : undefined
            },
            include: { sport_assignments: true }
        });
    }

    async updateVenue(id: string, userId: string, dto: UpdateVenueDto) {
        const venue = await this._verifyVenueAccess(userId, id);
        const { sport_types, ...rest } = dto;

        const updateData: any = { ...rest };
        if (dto.name && dto.name !== venue.name) {
            updateData.slug = await this.generateUniqueSlug(dto.name);
        }

        if (sport_types) {
            // Delete old assignments and create new ones
            await this.prisma.sport_assignments.deleteMany({
                where: { venue_id: venue.id }
            });
            updateData.sport_assignments = {
                create: sport_types.map(s => ({ sport_type: s }))
            };
        }

        return this.prisma.venues.update({
            where: { id: venue.id },
            data: updateData,
            include: { sport_assignments: true }
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

    async getVenueAmenities(venueId: string, userId: string) {
        const venue = await this._verifyVenueAccess(userId, venueId);
        return this.prisma.amenities.findMany({
            where: { venue_id: venue.id }
        });
    }

    async createVenueAmenity(venueId: string, userId: string, data: any) {
        const venue = await this._verifyVenueAccess(userId, venueId);
        return this.prisma.amenities.create({
            data: {
                venue_id: venue.id,
                name: data.name,
                icon: data.icon,
                is_free: data.is_free !== undefined ? data.is_free : true
            }
        });
    }

    async deleteVenueAmenity(venueId: string, amenityId: string, userId: string) {
        await this._verifyVenueAccess(userId, venueId);
        return this.prisma.amenities.delete({
            where: { id: amenityId }
        });
    }

    async updateVenueAmenity(venueId: string, amenityId: string, userId: string, data: any) {
        await this._verifyVenueAccess(userId, venueId);
        return this.prisma.amenities.update({
            where: { id: amenityId, venue_id: venueId },
            data: {
                name: data.name,
                icon: data.icon,
                is_free: data.is_free
            }
        });
    }

    async getScheduleExceptions(venueId: string, userId: string) {
        const venue = await this._verifyVenueAccess(userId, venueId);
        return this.prisma.venue_schedule_exceptions.findMany({
            where: { venue_id: venue.id },
            orderBy: { date: 'asc' }
        });
    }

    async createScheduleException(venueId: string, userId: string, data: any) {
        const venue = await this._verifyVenueAccess(userId, venueId);
        return this.prisma.venue_schedule_exceptions.create({
            data: {
                id: uuid(),
                venue_id: venue.id,
                date: new Date(data.date),
                open_time: data.opening_time ? new Date(`1970-01-01T${data.opening_time}Z`) : null,
                close_time: data.closing_time ? new Date(`1970-01-01T${data.closing_time}Z`) : null,
                is_closed: data.is_closed || false,
                reason: data.reason
            }
        });
    }

    async deleteScheduleException(venueId: string, exceptionId: string, userId: string) {
        await this._verifyVenueAccess(userId, venueId);
        return this.prisma.venue_schedule_exceptions.delete({
            where: { id: exceptionId }
        });
    }

    async getMediaAttachments(venueId: string, userId: string) {
        const venue = await this._verifyVenueAccess(userId, venueId);
        return this.prisma.media_attachments.findMany({
            where: { venue_id: venue.id },
            orderBy: { created_at: 'desc' }
        });
    }

    async createMediaAttachment(venueId: string, userId: string, data: any) {
        const venue = await this._verifyVenueAccess(userId, venueId);
        
        // Find existing file record if url is provided, or create a new files record
        let fileId = data.file_id;
        if (!fileId && data.public_url) {
            const file = await this.prisma.files.findFirst({ where: { public_url: data.public_url } });
            if (file) {
                 fileId = file.id;
            } else {
                 // Create record in files table if it doesn't exist
                 const newFile = await this.prisma.files.create({
                     data: {
                         id: uuid(),
                         user_id: userId,
                         original_name: data.original_name || 'image.jpg',
                         file_name: data.file_name || `${Date.now()}.jpg`,
                         file_size: BigInt(data.file_size || 0),
                         mime_type: data.mime_type || 'image/jpeg',
                         public_url: data.public_url
                     }
                 });
                 fileId = newFile.id;
            }
        }

        if (!fileId) {
            throw new BadRequestException('Thông tin tệp tin không hợp lệ.');
        }

        // If this is the first image, make it cover
        const count = await this.prisma.media_attachments.count({ where: { venue_id: venue.id } });

        const created = await this.prisma.media_attachments.create({
            data: {
                id: uuid(),
                venue_id: venue.id,
                file_id: fileId,
                is_cover: data.is_cover || count === 0,
                display_order: data.display_order || count
            },
            include: {
                files: true
            }
        });

        return {
            ...created,
            public_url: created.files.public_url
        };
    }

    async deleteMediaAttachment(venueId: string, mediaId: string, userId: string) {
        await this._verifyVenueAccess(userId, venueId);
        return this.prisma.media_attachments.delete({
            where: { id: mediaId }
        });
    }

    async setCoverMedia(venueId: string, mediaId: string, userId: string) {
        await this._verifyVenueAccess(userId, venueId);
        
        await this.prisma.media_attachments.updateMany({
            where: { venue_id: venueId },
            data: { is_cover: false }
        });

        return this.prisma.media_attachments.update({
            where: { id: mediaId },
            data: { is_cover: true }
        });
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

    // VENUE SERVICES
    async getVenueServices(venueId: string, userId: string) {
        const venue = await this._verifyVenueAccess(userId, venueId);
        return this.prisma.venue_services.findMany({
            where: { venue_id: venue.id },
            orderBy: { name: 'asc' }
        });
    }

    async createVenueService(venueId: string, userId: string, data: any) {
        const venue = await this._verifyVenueAccess(userId, venueId);
        return this.prisma.venue_services.create({
            data: {
                venue_id: venue.id,
                name: data.name,
                description: data.description,
                price: data.price,
                type: data.type,
                category: data.category,
                is_available: data.is_available ?? true,
                track_inventory: data.track_inventory ?? false,
                stock_quantity: data.stock_quantity ?? 0,
                unit: data.unit ?? 'UNIT'
            }
        });
    }

    async updateVenueService(venueId: string, serviceId: string, userId: string, data: any) {
        const venue = await this._verifyVenueAccess(userId, venueId);
        return this.prisma.venue_services.update({
            where: { id: serviceId, venue_id: venue.id },
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                type: data.type,
                category: data.category,
                is_available: data.is_available,
                track_inventory: data.track_inventory,
                stock_quantity: data.stock_quantity,
                unit: data.unit
            }
        });
    }

    async deleteVenueService(venueId: string, serviceId: string, userId: string) {
        const venue = await this._verifyVenueAccess(userId, venueId);
        return this.prisma.venue_services.delete({
            where: { id: serviceId, venue_id: venue.id }
        });
    }
}
