import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/role.constant';
import { LookupService } from './lookup.service';
import { ResponseUtil } from '../../common/utils/response.util';

@Controller('admin/lookup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF)
export class LookupController {
    constructor(private readonly lookupService: LookupService) {}

    @Get('users')
    async getUsers(
        @Query('search') search: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        const { items, total } = await this.lookupService.searchUsers(search, Number(page), Number(limit));
        const mappedUsers = (items as any[]).map(u => ({
            id: u.id,
            full_name: u.full_name,
            email: u.email,
            phone: u.phone,
            role_name: (u.role as any)?.name || 'N/A',
            status: u.status,
            created_at: u.created_at
        }));
        return ResponseUtil.paginated(mappedUsers, total, page, limit, 'Users retrieved successfully');
    }

    @Get('venues')
    async getVenues(
        @Query('search') search: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        const { items, total } = await this.lookupService.searchVenues(search, Number(page), Number(limit));
        const mappedVenues = (items as any[]).map(v => ({
            id: v.id,
            name: v.name,
            address: v.address,
            district: v.district,
            city: v.city,
            phone_number: v.phone || 'N/A',
            status: v.status,
            active_courts_count: (v._count as any)?.courts
        }));
        return ResponseUtil.paginated(mappedVenues, total, page, limit, 'Venues retrieved successfully');
    }

    @Get('bookings')
    async getBookings(
        @Query('search') search: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        const { items, total } = await this.lookupService.searchBookings(search, Number(page), Number(limit));
        const mappedBookings = (items as any[]).map(b => ({
            id: b.id,
            booking_code: b.booking_code,
            customer_name: (b.customers as any)?.full_name,
            customer_phone: (b.customers as any)?.phone || 'N/A',
            venue_name: (b.venues as any)?.name,
            total_price: Number(b.total_amount),
            status: b.status,
            created_at: b.created_at
        }));
        return ResponseUtil.paginated(mappedBookings, total, page, limit, 'Bookings retrieved successfully');
    }
}
