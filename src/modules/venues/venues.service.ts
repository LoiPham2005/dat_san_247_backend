import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DayOfWeek } from '../../common/constants/day-of-week.constant';
import { VenueFilterDto } from './dto/venue-filter.dto';
import { VenueStatus } from '../../common/constants/venue-status.constant';
import { StorageService } from '../../shared/storage/storage.service';
import { CreateVenueDto, UpdateVenueDto } from './dto/create-venue.dto';
import { AnalyticsService } from '../analytics/analytics.service';
import { ActivityType } from '../../common/constants/activity-type.constant';
import { UsersService } from '../users/users.service';
import { BookingStatus } from '../../common/constants/booking-status.constant';


@Injectable()
export class VenuesService {
    constructor(
        private prisma: PrismaService,
        private storageService: StorageService,
        private analyticsService: AnalyticsService,
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
    ) { }

    private mapVenue(venue: any) {
        if (!venue) return null;
        return {
            ...venue,
            ownerId: venue.owner_id,
            organizationId: venue.organization_id,
            rejectionReason: venue.rejection_reason,
            thumbnailUrl: venue.thumbnail_url,
            openingTime: venue.opening_time,
            closingTime: venue.closing_time,
            totalReviews: venue.total_reviews,
            isFeatured: venue.is_featured,
            featuredUntil: venue.featured_until,
            commissionRate: venue.commission_rate,
            ratingCleanliness: venue.rating_cleanliness,
            ratingFacilities: venue.rating_facilities,
            ratingStaff: venue.rating_staff,
            vatRate: venue.vat_rate,
            businessType: venue.business_type,
            isActive: venue.is_active,
            socialLinks: venue.social_links,
            autoAcceptBookings: venue.auto_accept_bookings,
            minBookingBeforeHours: venue.min_booking_before_hours,
            cancellationBeforeHours: venue.cancellation_before_hours,
            createdAt: venue.created_at,
            updatedAt: venue.updated_at,
            deletedAt: venue.deleted_at,
            courts: venue.courts?.map((court: any) => ({
                ...court,
                venueId: court.venue_id,
                sportTypes: court.sport_types,
                pricePerHour: Number(court.price_per_hour),
                isIndoor: court.is_indoor,
                isOutdoor: court.is_outdoor,
                surfaceType: court.surface_type,
                parentCourtId: court.parent_court_id,
                isActive: court.is_active,
                thumbnailUrl: court.thumbnail_url,
                pricingRules: court.pricing_rules?.map((rule: any) => ({
                    ...rule,
                    courtId: rule.court_id,
                    dayOfWeek: rule.day_of_week,
                    startTime: rule.start_time,
                    endTime: rule.end_time,
                    startDate: rule.start_date,
                    endDate: rule.end_date,
                    isActive: rule.is_active,
                })),
            })),
            operatingHours: venue.venue_operating_hours?.map((oh: any) => ({
                ...oh,
                venueId: oh.venue_id,
                dayOfWeek: oh.day_of_week,
                openingTime: oh.opening_time,
                closingTime: oh.closing_time,
                isClosed: oh.is_closed,
            })),
            owner: venue.users ? {
                ...venue.users,
                fullName: venue.users.full_name,
                avatarUrl: venue.users.avatar_url,
            } : undefined,
        };
    }

    async getAvailability(venueId: string, dateStr: string) {
        const date = new Date(dateStr);
        const dayOfWeek = this.getDayOfWeek(date);

        const venue = await this.prisma.venues.findUnique({
            where: { id: venueId },
            include: {
                courts: {
                    include: {
                        pricing_rules: {
                            where: { day_of_week: dayOfWeek as any, is_active: true }
                        }
                    }
                },
                venue_operating_hours: {
                    where: { day_of_week: dayOfWeek as any }
                }
            }
        });

        if (!venue) throw new NotFoundException('Venue not found');

        const bookings = await this.prisma.bookings.findMany({
            where: {
                venue_id: venueId,
                booking_date: date,
                status: {
                    in: [BookingStatus.CONFIRMED, BookingStatus.PENDING, BookingStatus.CHECKED_IN] as any
                }
            }
        });

        // Determine opening/closing times for the specific day
        const todayHours = venue.venue_operating_hours?.[0];

        if (todayHours?.is_closed) {
            return {
                venueId,
                date: dateStr,
                isClosed: true,
                courts: []
            };
        }

        const openingTime = todayHours?.opening_time ? this.formatTime(todayHours.opening_time) : this.formatTime(venue.opening_time);
        const closingTime = todayHours?.closing_time ? this.formatTime(todayHours.closing_time) : this.formatTime(venue.closing_time);
        const slots = this.generateTimeSlots(openingTime, closingTime);

        const availability = venue.courts.map(court => {
            const courtBookings = bookings.filter(b => b.court_id === court.id);
            const courtPricingRules = court.pricing_rules;

            const courtSlots = slots.map(slotTime => {
                const isBooked = courtBookings.some(b => {
                    const bStart = this.formatTime(b.start_time);
                    const bEnd = this.formatTime(b.end_time);
                    return slotTime >= bStart && slotTime < bEnd;
                });

                // Find applicable price for this slot
                const applicableRule = courtPricingRules.find(r =>
                    slotTime >= this.formatTime(r.start_time) && slotTime < this.formatTime(r.end_time)
                );

                // If no rule, use default court price (prorated to 30 mins)
                const price = applicableRule ? Number(applicableRule.price) / 2 : Number(court.price_per_hour) / 2;

                return {
                    time: slotTime.substring(0, 5),
                    available: !isBooked,
                    price: Number(price)
                };
            });

            return {
                courtId: court.id,
                courtName: court.name,
                sportTypes: court.sport_types,
                pricePerHour: Number(court.price_per_hour),
                slots: courtSlots
            };
        });

        return {
            venueId,
            date: dateStr,
            openingTime: openingTime.substring(0, 5),
            closingTime: closingTime.substring(0, 5),
            courts: availability
        };
    }

    private formatTime(time: Date | string): string {
        if (typeof time === 'string') return time;
        return time.toTimeString().split(' ')[0];
    }

    private getDayOfWeek(date: Date): DayOfWeek {
        const days = [DayOfWeek.SUNDAY, DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY];
        return days[date.getDay()];
    }

    private generateTimeSlots(start: string, end: string): string[] {
        const slots: string[] = [];
        let current = start;

        while (current < end) {
            slots.push(current);
            const [h, m, s] = current.split(':').map(Number);
            let nextH = h;
            let nextM = m + 30;
            if (nextM >= 60) {
                nextH++;
                nextM = 0;
            }
            if (nextH >= 24) break;
            current = `${nextH.toString().padStart(2, '0')}:${nextM.toString().padStart(2, '0')}:00`;
        }

        return slots;
    }

    async findAll(filter: VenueFilterDto) {
        const { page = 1, limit = 10, status, search, city, sportType, minPrice, maxPrice, rating, amenities: amenityFilter } = filter;
        const skip = (page - 1) * limit;

        const where: any = {
            deleted_at: null
        };

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (city) {
            where.city = city;
        }

        if (sportType) {
            where.courts = {
                some: {
                    sport_types: {
                        array_contains: sportType
                    }
                }
            };
        }

        if (minPrice || maxPrice) {
            where.courts = {
                ...where.courts,
                some: {
                    ...(where.courts?.some || {}),
                    price_per_hour: {
                        ...(minPrice ? { gte: minPrice } : {}),
                        ...(maxPrice ? { lte: maxPrice } : {}),
                    }
                }
            };
        }

        if (rating) {
            where.rating = { gte: rating };
        }

        if (amenityFilter) {
            const amenityList = amenityFilter.split(',').map(a => a.trim());
            where.amenities = {
                path: ['$'],
                array_contains: amenityList.map(name => ({ name }))
            };
        }

        const [items, total] = await Promise.all([
            this.prisma.venues.findMany({
                where,
                include: {
                    users: true,
                    courts: true,
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.venues.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            items: items.map(venue => this.mapVenue(venue)),
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }

    async findOne(id: string, userId?: string) {
        const venue = await this.prisma.venues.findUnique({
            where: { id },
            include: {
                users: true,
                courts: {
                    include: {
                        pricing_rules: true
                    }
                }
            }
        });
        if (!venue) throw new NotFoundException('Venue not found');

        // Fetch gallery images from files model
        const images = await this.prisma.files.findMany({
            where: { target_type: 'VENUE', target_id: id },
            orderBy: { display_order: 'asc' }
        });

        // Add isFavorited if userId is provided
        let isFavorited = false;
        if (userId) {
            const favorite = await this.prisma.favorite_venues.findUnique({
                where: {
                    user_id_venue_id: {
                        user_id: userId,
                        venue_id: id
                    }
                }
            });
            isFavorited = !!favorite;
        }

        return { ...this.mapVenue(venue), images, isFavorited };
    }

    async update(id: string, data: any) {
        const mappedData: any = {};
        if (data.name) mappedData.name = data.name;
        if (data.description) mappedData.description = data.description;
        if (data.address) mappedData.address = data.address;
        if (data.city) mappedData.city = data.city;
        if (data.district) mappedData.district = data.district;
        if (data.ward) mappedData.ward = data.ward;
        if (data.phone) mappedData.phone = data.phone;
        if (data.email) mappedData.email = data.email;
        if (data.thumbnailUrl) mappedData.thumbnail_url = data.thumbnailUrl;
        if (data.status) mappedData.status = data.status;
        if (data.isActive !== undefined) mappedData.is_active = data.isActive;

        await this.prisma.venues.update({
            where: { id },
            data: mappedData
        });
        return this.findOne(id);
    }

    async updateStatus(id: string, status: VenueStatus, reason?: string, userId?: string) {
        const venue = await this.prisma.venues.update({
            where: { id },
            data: {
                status: status as any,
                rejection_reason: reason
            }
        });

        if (userId) {
            await this.analyticsService.logActivity({
                userId,
                activityType: status === VenueStatus.APPROVED ? ActivityType.VENUE_APPROVED : ActivityType.VENUE_REJECTED,
                entityType: 'VENUE',
                entityId: id,
                description: `${status === VenueStatus.APPROVED ? 'Approved' : 'Rejected'} venue: ${venue.name}${reason ? `. Reason: ${reason}` : ''}`,
                metadata: { status, reason }
            });
        }

        return this.mapVenue(venue);
    }

    async toggleFeatured(id: string) {
        const venue = await this.prisma.venues.findUnique({ where: { id } });
        if (!venue) throw new NotFoundException('Venue not found');

        return this.prisma.venues.update({
            where: { id },
            data: { is_featured: !venue.is_featured }
        });
    }

    async softDelete(id: string) {
        return this.prisma.venues.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
    }

    async findAllByOwner(ownerId: string, filter: VenueFilterDto) {
        const { page = 1, limit = 10, status, search, city, sportType, minPrice, maxPrice } = filter;
        const skip = (page - 1) * limit;

        const where: any = {
            owner_id: ownerId,
            deleted_at: null
        };

        if (status) where.status = status;
        if (search) where.name = { contains: search, mode: 'insensitive' };
        if (city) where.city = city;
        if (sportType || minPrice || maxPrice) {
            where.courts = {
                some: {
                    ...(sportType ? { sport_types: { array_contains: sportType } } : {}),
                    ...(minPrice || maxPrice ? {
                        price_per_hour: {
                            ...(minPrice ? { gte: minPrice } : {}),
                            ...(maxPrice ? { lte: maxPrice } : {}),
                        }
                    } : {})
                }
            };
        }

        const [items, total] = await Promise.all([
            this.prisma.venues.findMany({
                where,
                include: { courts: true },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.venues.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            items: items.map(v => this.mapVenue(v)),
            meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 },
        };
    }

    async findOneByOwner(ownerId: string, id: string) {
        const venue = await this.prisma.venues.findFirst({
            where: { id, owner_id: ownerId, deleted_at: null },
            include: {
                courts: {
                    include: {
                        pricing_rules: true
                    }
                }
            }
        });
        if (!venue) throw new NotFoundException('Venue not found or not owned by user');

        const images = await this.prisma.files.findMany({
            where: { target_type: 'VENUE', target_id: id },
            orderBy: { display_order: 'asc' }
        });

        return { ...this.mapVenue(venue), images };
    }

    async createOwnerVenue(ownerId: string, dto: CreateVenueDto, files: { thumbnail?: any, images?: any[] }) {
        let { name } = dto;
        let slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const existing = await this.prisma.venues.findUnique({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Math.random().toString(36).substring(7)}`;
        }

        let thumbnailUrl: string | undefined = undefined;
        if (files.thumbnail) {
            thumbnailUrl = await this.storageService.uploadFile(files.thumbnail, 'venues/thumbnails');
        }

        const { amenities, ...venueDto } = dto;

        const result = await this.prisma.$transaction(async (tx) => {
            const venue = await tx.venues.create({
                data: {
                    name: venueDto.name,
                    description: venueDto.description,
                    address: venueDto.address,
                    city: venueDto.city,
                    district: venueDto.district,
                    ward: venueDto.ward,
                    latitude: venueDto.latitude,
                    longitude: venueDto.longitude,
                    phone: venueDto.phone,
                    email: venueDto.email,
                    opening_time: (dto as any).openingTime ? new Date(`1970-01-01T${(dto as any).openingTime}`) : undefined,
                    closing_time: (dto as any).closingTime ? new Date(`1970-01-01T${(dto as any).closingTime}`) : undefined,
                    amenities: amenities ? amenities.map(name => ({ name })) : [],
                    slug,
                    owner_id: ownerId,
                    thumbnail_url: thumbnailUrl,
                    status: VenueStatus.PENDING as any,
                    is_active: true
                }
            });

            if (files.images && files.images.length > 0) {
                for (let i = 0; i < files.images.length; i++) {
                    const url = await this.storageService.uploadFile(files.images[i], `venues/${venue.id}/gallery`);
                    await tx.files.create({
                        data: {
                            user_id: ownerId,
                            original_name: files.images[i].originalname,
                            file_name: files.images[i].originalname,
                            public_url: url,
                            file_size: BigInt(files.images[i].size),
                            mime_type: files.images[i].mimetype,
                            target_type: 'VENUE',
                            target_id: venue.id,
                            display_order: i,
                            category: 'VENUE_IMAGE' as any
                        }
                    });
                }
            }
            return venue;
        });

        return this.findOneByOwner(ownerId, result.id);
    }

    async updateByOwner(ownerId: string, id: string, dto: UpdateVenueDto, files: { thumbnail?: any, images?: any[] } = {}) {
        const venue = await this.findOneByOwner(ownerId, id);

        const { amenities, ...venueDto } = dto;
        let thumbnailUrl = venue.thumbnailUrl;

        if (files.thumbnail) {
            if (venue.thumbnailUrl) {
                await this.storageService.deleteFile(venue.thumbnailUrl).catch(() => { });
            }
            thumbnailUrl = await this.storageService.uploadFile(files.thumbnail, 'venues/thumbnails');
        }

        return this.prisma.$transaction(async (tx) => {
            if (files.images && files.images.length > 0) {
                const currentImagesCount = await tx.files.count({ where: { target_type: 'VENUE', target_id: id } });
                for (let i = 0; i < files.images.length; i++) {
                    const url = await this.storageService.uploadFile(files.images[i], `venues/${id}/gallery`);
                    await tx.files.create({
                        data: {
                            user_id: ownerId,
                            original_name: files.images[i].originalname,
                            file_name: files.images[i].originalname,
                            public_url: url,
                            file_size: BigInt(files.images[i].size),
                            mime_type: files.images[i].mimetype,
                            target_type: 'VENUE',
                            target_id: id,
                            display_order: currentImagesCount + i,
                            category: 'VENUE_IMAGE' as any
                        }
                    });
                }
            }

            const dataToUpdate: any = {};
            if (venueDto.name) dataToUpdate.name = venueDto.name;
            if (venueDto.description !== undefined) dataToUpdate.description = venueDto.description;
            if (venueDto.address) dataToUpdate.address = venueDto.address;
            if (venueDto.city) dataToUpdate.city = venueDto.city;
            if (venueDto.district) dataToUpdate.district = venueDto.district;
            if (venueDto.ward !== undefined) dataToUpdate.ward = venueDto.ward;
            if (venueDto.latitude !== undefined) dataToUpdate.latitude = venueDto.latitude;
            if (venueDto.longitude !== undefined) dataToUpdate.longitude = venueDto.longitude;
            if (venueDto.phone !== undefined) dataToUpdate.phone = venueDto.phone;
            if (venueDto.email !== undefined) dataToUpdate.email = venueDto.email;
            if ((dto as any).openingTime) dataToUpdate.opening_time = new Date(`1970-01-01T${(dto as any).openingTime}`);
            if ((dto as any).closingTime) dataToUpdate.closing_time = new Date(`1970-01-01T${(dto as any).closingTime}`);
            if (amenities !== undefined) {
                dataToUpdate.amenities = amenities.map(name => ({ name }));
            }
            if (thumbnailUrl) {
                dataToUpdate.thumbnail_url = thumbnailUrl;
            }

            await tx.venues.update({
                where: { id },
                data: dataToUpdate
            });

            return this.findOneByOwner(ownerId, id);
        });
    }

    async softDeleteByOwner(ownerId: string, id: string) {
        await this.findOneByOwner(ownerId, id);
        await this.prisma.venues.update({
            where: { id },
            data: { deleted_at: new Date() }
        });
        return { success: true };
    }

    async findAllStaffByOwner(ownerId: string) {
        const staffs = await this.prisma.venue_staff.findMany({
            where: {
                venues: {
                    owner_id: ownerId
                }
            },
            include: {
                venues: true,
                users: true
            }
        });

        return staffs.map(staff => ({
            ...staff,
            venue: this.mapVenue(staff.venues),
            user: {
                ...staff.users,
                fullName: staff.users.full_name,
                avatarUrl: staff.users.avatar_url
            }
        }));
    }

    async createStaff(ownerId: string, data: any) {
        const { venueId, email } = data;
        await this.findOneByOwner(ownerId, venueId);

        const user = await this.usersService.findByEmail(email);
        if (!user) throw new NotFoundException('User with this email not found');

        const existing = await this.prisma.venue_staff.findUnique({
            where: {
                venue_id_user_id: {
                    venue_id: venueId,
                    user_id: user.id
                }
            }
        });
        if (existing) throw new BadRequestException('User is already assigned to this venue');

        return this.prisma.venue_staff.create({
            data: {
                venue_id: venueId,
                user_id: user.id
            }
        });
    }

    async removeStaff(ownerId: string, id: string) {
        const staff = await this.prisma.venue_staff.findUnique({
            where: { id },
            include: { venues: true }
        });

        if (!staff || staff.venues.owner_id !== ownerId) {
            throw new NotFoundException('Staff assignment not found or not authorized');
        }

        return this.prisma.venue_staff.delete({ where: { id } });
    }

    async toggleStaffStatus(ownerId: string, id: string) {
        const staff = await this.prisma.venue_staff.findUnique({
            where: { id },
            include: { venues: true }
        });

        if (!staff || staff.venues.owner_id !== ownerId) {
            throw new NotFoundException('Staff assignment not found or not authorized');
        }

        return this.usersService.toggleStatus(staff.user_id);
    }

    async findFeatured() {
        const venues = await this.prisma.venues.findMany({
            where: {
                is_featured: true,
                status: VenueStatus.APPROVED as any,
                deleted_at: null
            },
            take: 10
        });

        const result: any[] = [];
        for (const venue of venues) {
            const images = await this.prisma.files.findMany({
                where: { target_type: 'VENUE', target_id: venue.id },
                orderBy: { display_order: 'asc' },
                take: 5
            });
            result.push({ ...this.mapVenue(venue), images });
        }
        return result;
    }

    async findMyFavorites(userId: string) {
        const favorites = await (this.prisma.favorite_venues as any).findMany({
            where: { user_id: userId },
            include: { venues: true }
        });

        const venues = favorites.map((f: any) => f.venues);
        const result: any[] = [];
        for (const venue of venues) {
            const images = await (this.prisma.files as any).findMany({
                where: { target_type: 'VENUE', target_id: venue.id },
                orderBy: { display_order: 'asc' },
                take: 1
            });
            result.push({ ...this.mapVenue(venue), images });
        }
        return result;
    }

    async toggleFavorite(userId: string, venueId: string, isFavorite: boolean) {
        if (isFavorite) {
            const exists = await (this.prisma.favorite_venues as any).findUnique({
                where: {
                    user_id_venue_id: {
                        user_id: userId,
                        venue_id: venueId
                    }
                }
            });
            if (!exists) {
                await (this.prisma.favorite_venues as any).create({
                    data: {
                        user_id: userId,
                        venue_id: venueId
                    }
                });
            }
        } else {
            await (this.prisma.favorite_venues as any).delete({
                where: {
                    user_id_venue_id: {
                        user_id: userId,
                        venue_id: venueId
                    }
                }
            }).catch(() => { });
        }
        return { success: true };
    }

    async getVenueReviews(venueId: string, pagination: any) {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            (this.prisma.reviews as any).findMany({
                where: {
                    venue_id: venueId,
                    is_visible: true
                },
                include: {
                    users: true
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit
            }),
            (this.prisma.reviews as any).count({
                where: {
                    venue_id: venueId,
                    is_visible: true
                }
            })
        ]);

        const result: any[] = [];
        for (const review of items) {
            const images = await (this.prisma.files as any).findMany({
                where: { target_type: 'REVIEW', target_id: review.id },
                orderBy: { display_order: 'asc' }
            });
            result.push({
                ...review,
                user: {
                    ...review.users,
                    fullName: review.users.full_name,
                    avatarUrl: review.users.avatar_url
                },
                images
            });
        }

        return {
            items: result,
            meta: { total, page, limit }
        };
    }

    async getAssignedVenueIds(userId: string): Promise<string[]> {
        const assignments = await (this.prisma.venue_staff as any).findMany({
            where: { user_id: userId },
            select: { venue_id: true }
        });
        return (assignments as any[]).map(a => a.venue_id);
    }

    async findByIds(ids: string[]) {
        if (ids.length === 0) return [];
        const venues = await (this.prisma.venues as any).findMany({
            where: {
                id: { in: ids },
                deleted_at: null
            }
        });

        const result: any[] = [];
        for (const venue of venues) {
            const images = await (this.prisma.files as any).findMany({
                where: { target_type: 'VENUE', target_id: venue.id },
                orderBy: { display_order: 'asc' },
                take: 1
            });
            result.push({ ...this.mapVenue(venue), images });
        }
        return result;
    }
}
