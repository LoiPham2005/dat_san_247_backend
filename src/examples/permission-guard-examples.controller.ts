import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

/**
 * EXAMPLE: Sử dụng Permission Guard trong Controller
 * 
 * Thay vì dùng @Roles(UserRole.ADMIN) như trước,
 * giờ dùng @RequirePermissions('resource:action')
 */

@Controller('example-venues')
@UseGuards(PermissionsGuard) // Apply guard cho toàn bộ controller
export class ExampleVenuesController {

    /**
     * Endpoint PUBLIC - Không cần permission
     */
    @Get('public')
    getPublicVenues() {
        return { message: 'Anyone can access this' };
    }

    /**
     * Chỉ user có permission 'venues:read' mới truy cập được
     */
    @Get()
    @RequirePermissions('venues:read')
    getAllVenues() {
        return { message: 'You have venues:read permission' };
    }

    /**
     * Cần permission 'venues:create'
     */
    @Post()
    @RequirePermissions('venues:create')
    createVenue(@Body() data: any) {
        return { message: 'Venue created' };
    }

    /**
     * Cần CẢ HAI permissions: 'venues:update' VÀ 'venues:manage'
     * User phải có đủ cả 2 mới được phép
     */
    @Put(':id')
    @RequirePermissions('venues:update', 'venues:manage')
    updateVenue(@Param('id') id: string, @Body() data: any) {
        return { message: 'Venue updated' };
    }

    /**
     * Chỉ Super Admin (có permission '*') hoặc user có 'venues:delete'
     */
    @Delete(':id')
    @RequirePermissions('venues:delete')
    deleteVenue(@Param('id') id: string) {
        return { message: 'Venue deleted' };
    }

    /**
     * Endpoint cho Owner - Quản lý sân của mình
     */
    @Get('my-venues')
    @RequirePermissions('venues:manage')
    getMyVenues() {
        return { message: 'Your venues' };
    }

    /**
     * Endpoint cho Staff - Chỉ xem
     */
    @Get('staff-view')
    @RequirePermissions('venues:read')
    getVenuesForStaff() {
        return { message: 'Read-only view for staff' };
    }
}

/**
 * EXAMPLE 2: Bookings với nhiều permission levels
 */
@Controller('example-bookings')
@UseGuards(PermissionsGuard)
export class ExampleBookingsController {

    /**
     * Customer có thể tạo booking
     */
    @Post()
    @RequirePermissions('bookings:create')
    createBooking(@Body() data: any) {
        return { message: 'Booking created' };
    }

    /**
     * Customer chỉ xem booking của mình
     */
    @Get('my-bookings')
    @RequirePermissions('bookings:read-own')
    getMyBookings() {
        return { message: 'Your bookings only' };
    }

    /**
     * Admin/Staff xem tất cả bookings
     */
    @Get('all')
    @RequirePermissions('bookings:read')
    getAllBookings() {
        return { message: 'All bookings in system' };
    }

    /**
     * Venue Staff check-in khách
     */
    @Post(':id/check-in')
    @RequirePermissions('bookings:check-in')
    checkIn(@Param('id') id: string) {
        return { message: 'Customer checked in' };
    }

    /**
     * Chỉ Admin mới được xóa booking
     */
    @Delete(':id')
    @RequirePermissions('bookings:delete')
    deleteBooking(@Param('id') id: string) {
        return { message: 'Booking deleted' };
    }
}

/**
 * EXAMPLE 3: Admin-only endpoints
 */
@Controller('example-super-admin')
@UseGuards(PermissionsGuard)
export class ExampleSuperAdminController {

    /**
     * Quản lý users
     */
    @Get('users')
    @RequirePermissions('users:read')
    getAllUsers() {
        return { message: 'List all users' };
    }

    @Post('users')
    @RequirePermissions('users:create')
    createUser(@Body() data: any) {
        return { message: 'User created' };
    }

    @Delete('users/:id')
    @RequirePermissions('users:delete')
    deleteUser(@Param('id') id: string) {
        return { message: 'User deleted' };
    }

    /**
     * Quản lý roles (chỉ Super Admin)
     */
    @Get('roles')
    @RequirePermissions('roles:read')
    getAllRoles() {
        return { message: 'List all roles' };
    }

    @Post('roles')
    @RequirePermissions('roles:create')
    createRole(@Body() data: any) {
        return { message: 'Role created' };
    }

    /**
     * Xem analytics
     */
    @Get('analytics')
    @RequirePermissions('analytics:view')
    getAnalytics() {
        return { message: 'System analytics' };
    }
}

/**
 * LƯU Ý:
 * 
 * 1. Super Admin (có permission '*') sẽ bypass tất cả check
 * 
 * 2. Nếu endpoint KHÔNG có @RequirePermissions(), 
 *    nhưng có @UseGuards(PermissionsGuard), 
 *    thì endpoint đó PUBLIC (ai cũng truy cập được)
 * 
 * 3. Để endpoint thực sự PUBLIC, bỏ @UseGuards() hoặc 
 *    không khai báo @RequirePermissions()
 * 
 * 4. Có thể kết hợp nhiều Guards:
 *    @UseGuards(JwtAuthGuard, PermissionsGuard)
 * 
 * 5. Permission naming convention: 'resource:action'
 *    - users:create
 *    - bookings:read
 *    - venues:manage
 */