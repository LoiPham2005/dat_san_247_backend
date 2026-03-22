import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VenuesQueryService {
    constructor(private prisma: PrismaService) { }

    async searchVenues(params: any, userId?: string) {
        const { keyword, sport_type, city, district } = params;

        const where: any = {
            deleted_at: null,
            status: 'APPROVED',
            is_active: true
        };

        if (keyword) {
            where.OR = [
                { name: { contains: keyword, mode: 'insensitive' } },
                { district: { contains: keyword, mode: 'insensitive' } },
                { city: { contains: keyword, mode: 'insensitive' } }
            ];
        }

        if (sport_type) {
            where.sport_assignments = {
                some: { sport_type: sport_type }
            };
        }

        if (city) where.city = city;
        if (district) where.district = district;

        const courtFilter: any = {};
        if (params.price_min) courtFilter.gte = parseFloat(params.price_min);
        if (params.price_max) courtFilter.lte = parseFloat(params.price_max);

        if (Object.keys(courtFilter).length > 0) {
            where.courts = { some: { price_per_hour: courtFilter, deleted_at: null, is_active: true } };
        }

        const venues = await this.prisma.venues.findMany({
            where,
            include: {
                sport_assignments: true,
                amenities: true,
                courts: {
                    where: { deleted_at: null, is_active: true }
                }
            },
            take: 20,
            orderBy: { rating: 'desc' }
        });

        return venues.map(v => {
            const prices = v.courts.map(c => Number(c.price_per_hour));
            const min_price = prices.length > 0 ? Math.min(...prices) : 0;
            return {
                id: v.id,
                slug: v.slug,
                name: v.name,
                description: v.description,
                address: v.address,
                city: v.city,
                district: v.district,
                thumbnail_url: v.thumbnail_url || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600',
                average_rating: Number(v.rating) || 0,
                review_count: v.total_reviews || 0,
                is_verified: true,
                sports: v.sport_assignments.map(s => s.sport_type),
                min_price: min_price,
            };
        });
    }

    async getVenueDetail(slug: string) {
        const venue = await this.prisma.venues.findFirst({
            where: { slug, deleted_at: null },
            include: {
                sport_assignments: true,
                amenities: true,
                courts: {
                    where: { deleted_at: null, is_active: true },
                    include: {
                        pricing_rules: {
                            where: { is_active: true }
                        },
                        amenities: true
                    }
                },
                reviews: {
                    where: { is_visible: true, deleted_at: null },
                    include: {
                        users: {
                            select: { full_name: true }
                        }
                    },
                    take: 10,
                    orderBy: { created_at: 'desc' }
                }
            }
        });
        
        if (!venue) throw new NotFoundException('Không tìm thấy sân');
        
        const min_price = venue.courts.length > 0 ? Math.min(...venue.courts.map(c => Number(c.price_per_hour))) : 0;

        const allAmenities = [...(venue.amenities || [])];
        venue.courts.forEach(c => {
            if (c.amenities) {
                c.amenities.forEach(ca => {
                    if (!allAmenities.some(a => a.name === ca.name)) {
                        allAmenities.push(ca);
                    }
                });
            }
        });

        return {
            ...venue,
            amenities: allAmenities,
            average_rating: Number(venue.rating) || 0,
            review_count: venue.total_reviews || 0,
            min_price,
            sports: venue.sport_assignments.map(s => s.sport_type),
            thumbnail_url: venue.thumbnail_url || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600',
            is_verified: true,
            reviews: venue.reviews.map(r => ({
                id: r.id,
                customer_name: (r as any).users.full_name,
                rating: r.rating,
                comment: r.comment,
                created_at: r.created_at
            }))
        };
    }

    async getVenueSchedule(slug: string, dateStr: string) {
        // dateStr format: YYYY-MM-DD
        const venue = await this.prisma.venues.findFirst({
            where: { slug, deleted_at: null },
            include: {
                courts: {
                    where: { deleted_at: null, is_active: true },
                    include: {
                        sport_assignments: true,
                        pricing_rules: {
                            where: { is_active: true }
                        }
                    }
                }
            }
        });

        if (!venue) throw new NotFoundException('Không tìm thấy sân');

        const date = new Date(`${dateStr}T00:00:00Z`);

        // Lấy tất cả các booking không bị CANCELLED trong ngày đó
        const bookings = await this.prisma.bookings.findMany({
            where: {
                venue_id: venue.id,
                booking_date: date,
                status: {
                    in: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED']
                }
            },
            select: {
                court_id: true,
                start_time: true,
                end_time: true
            }
        });

        return {
            venue: {
                id: venue.id,
                name: venue.name,
                address: venue.address
            },
            date: dateStr,
            courts: venue.courts.map(c => ({
                id: c.id,
                name: c.name,
                type: c.sport_assignments?.[0]?.sport_type || 'Thường',
                price_per_hour: Number(c.price_per_hour),
                pricing_rules: c.pricing_rules.map(pr => ({
                    id: pr.id,
                    name: pr.name,
                    price: Number(pr.price),
                    start_time: pr.start_time.toISOString().split('T')[1].substring(0, 5), // 'HH:mm'
                    end_time: pr.end_time.toISOString().split('T')[1].substring(0, 5),     // 'HH:mm'
                    day_of_week: pr.day_of_week
                }))
            })),
            bookings: bookings.map(b => ({
                court_id: b.court_id,
                start_time: b.start_time.toISOString().split('T')[1].substring(0, 5),
                end_time: b.end_time.toISOString().split('T')[1].substring(0, 5)
            }))
        };
    }

    async getFavorites(userId: string) {
        const favorites = await this.prisma.favorite_venues.findMany({
            where: { user_id: userId },
            include: {
                venues: {
                    include: {
                        sport_assignments: true,
                        courts: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        
        return favorites.map(f => {
            const min_price = f.venues.courts.length > 0 ? Math.min(...f.venues.courts.map(c => Number(c.price_per_hour))) : 0;
            return {
                id: `${f.user_id}_${f.venue_id}`,
                venue_id: f.venue_id,
                created_at: f.created_at,
                venue: {
                    id: f.venues.id,
                    name: f.venues.name,
                    slug: f.venues.slug,
                    thumbnail_url: f.venues.thumbnail_url || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600',
                    address: f.venues.address,
                    average_rating: Number(f.venues.rating) || 0,
                    review_count: f.venues.total_reviews || 0,
                    sports: f.venues.sport_assignments.map(s => s.sport_type),
                    min_price: min_price
                }
            }
        });
    }

    async toggleFavorite(userId: string, venueId: string) {
        const existing = await this.prisma.favorite_venues.findUnique({
            where: {
                user_id_venue_id: { user_id: userId, venue_id: venueId }
            }
        });

        if (existing) {
            await this.prisma.favorite_venues.delete({
                where: { user_id_venue_id: { user_id: userId, venue_id: venueId } }
            });
            return false;
        } else {
            await this.prisma.favorite_venues.create({
                data: { user_id: userId, venue_id: venueId }
            });
            return true;
        }
    }

    async getSearchHistory(userId: string) {
        const historyList = await this.prisma.search_history.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: 20
        });

        const unique: any[] = [];
        const set = new Set();
        for (const item of historyList) {
            if (!set.has(item.search_query)) {
                set.add(item.search_query);
                unique.push({
                    id: item.id,
                    keyword: item.search_query,
                    filters: { sport: item.sport_type },
                    searched_at: item.created_at
                });
            }
            if (unique.length >= 5) break; 
        }
        return unique;
    }

    async clearSearchHistory(userId: string) {
        return this.prisma.search_history.deleteMany({
            where: { user_id: userId }
        });
    }

    async saveSearchHistory(userId: string, keyword: string, sportType?: string) {
        if (!keyword.trim()) return;
        return this.prisma.search_history.create({
            data: {
                user_id: userId,
                search_query: keyword.trim(),
                sport_type: sportType || null
            }
        });
    }
}
