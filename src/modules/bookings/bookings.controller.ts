import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CancelBookingDto } from './dto/cancel-bBooking.dto';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // =====================================================
  // CREATE
  // =====================================================
  @Post()
  @ApiOperation({ summary: 'Create new booking' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateBookingDto) {
    const booking = await this.bookingsService.create(userId, dto);
    return {
      success: true,
      message: 'Booking created successfully',
      data: booking,
    };
  }

  // =====================================================
  // READ - My Bookings
  // =====================================================
  @Get('my-bookings')
  @ApiOperation({ summary: 'Get my bookings' })
  async getMyBookings(
    @CurrentUser('id') userId: string,
    @Query() filters: BookingFilterDto,
  ) {
    const bookings = await this.bookingsService.findAll(userId, filters);
    return {
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
      total: bookings.length,
    };
  }

  // =====================================================
  // READ - Booking by ID
  // =====================================================
  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const booking = await this.bookingsService.findOne(id, userId);
    return {
      success: true,
      message: 'Booking retrieved successfully',
      data: booking,
    };
  }

  // =====================================================
  // READ - Booking by Code
  // =====================================================
  @Get('code/:bookingCode')
  @ApiOperation({ summary: 'Get booking by code' })
  async findByCode(@Param('bookingCode') bookingCode: string) {
    const booking = await this.bookingsService.findByCode(bookingCode);
    return {
      success: true,
      message: 'Booking retrieved successfully',
      data: booking,
    };
  }

  // =====================================================
  // READ - Available Slots
  // =====================================================
  @Get('court/:courtId/available')
  @Public()
  @ApiOperation({ summary: 'Get available slots for court' })
  async getAvailableSlots(
    @Param('courtId') courtId: string,
    @Query('date') date: string,
  ) {
    const slots = await this.bookingsService.getAvailableSlots(courtId, date);
    return {
      success: true,
      message: 'Available slots retrieved successfully',
      data: slots,
    };
  }

  // =====================================================
  // READ - Calculate Price
  // =====================================================
  @Post('calculate-price')
  @Public()
  @ApiOperation({ summary: 'Calculate booking price' })
  async calculatePrice(
    @Body()
    body: {
      courtId: string;
      date: string;
      startTime: string;
      endTime: string;
    },
  ) {
    const pricing = await this.bookingsService.calculatePrice(
      body.courtId,
      body.date,
      body.startTime,
      body.endTime,
    );
    return {
      success: true,
      message: 'Price calculated successfully',
      data: pricing,
    };
  }

  // =====================================================
  // READ - Statistics
  // =====================================================
  @Get('statistics/my-stats')
  @ApiOperation({ summary: 'Get my booking statistics' })
  async getStatistics(@CurrentUser('id') userId: string) {
    const stats = await this.bookingsService.getBookingStatistics(userId);
    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  // =====================================================
  // UPDATE
  // =====================================================
  @Put(':id')
  @ApiOperation({ summary: 'Update booking' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateBookingDto,
  ) {
    const booking = await this.bookingsService.update(id, userId, dto);
    return {
      success: true,
      message: 'Booking updated successfully',
      data: booking,
    };
  }

  // =====================================================
  // UPDATE - Cancel
  // =====================================================
  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CancelBookingDto,
  ) {
    const booking = await this.bookingsService.cancel(id, userId, dto);
    return {
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    };
  }

  // =====================================================
  // UPDATE - Confirm (Owner only)
  // =====================================================
  @Post(':id/confirm')
  @Roles(UserRole.VENUE_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Confirm booking' })
  async confirm(
    @Param('id') id: string,
    @CurrentUser('id') ownerId: string,
  ) {
    const booking = await this.bookingsService.confirmBooking(id, ownerId);
    return {
      success: true,
      message: 'Booking confirmed successfully',
      data: booking,
    };
  }

  // =====================================================
  // UPDATE - Check-in (Owner only)
  // =====================================================
  @Post(':id/check-in')
  @Roles(UserRole.VENUE_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Check-in to booking' })
  async checkIn(
    @Param('id') id: string,
    @CurrentUser('id') ownerId: string,
  ) {
    const booking = await this.bookingsService.checkIn(id, ownerId);
    return {
      success: true,
      message: 'Check-in successful',
      data: booking,
    };
  }

  // =====================================================
  // UPDATE - Check-out (Owner only)
  // =====================================================
  @Post(':id/check-out')
  @Roles(UserRole.VENUE_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Check-out from booking' })
  async checkOut(
    @Param('id') id: string,
    @CurrentUser('id') ownerId: string,
  ) {
    const booking = await this.bookingsService.checkOut(id, ownerId);
    return {
      success: true,
      message: 'Check-out successful',
      data: booking,
    };
  }

  // =====================================================
  // UPDATE - Add Rating
  // =====================================================
  @Post(':id/rating')
  @ApiOperation({ summary: 'Add rating to booking' })
  async addRating(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { rating: number; review?: string },
  ) {
    const booking = await this.bookingsService.addRating(
      id,
      userId,
      body.rating,
      body.review,
    );
    return {
      success: true,
      message: 'Rating added successfully',
      data: booking,
    };
  }

  // =====================================================
  // ADMIN - Venue Bookings
  // =====================================================
  @Get('venue/:venueId/bookings')
  @Roles(UserRole.VENUE_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get venue bookings' })
  async getVenueBookings(
    @Param('venueId') venueId: string,
    @Query() filters: BookingFilterDto,
  ) {
    const bookings = await this.bookingsService.findVenueBookings(venueId, filters);
    return {
      success: true,
      message: 'Venue bookings retrieved successfully',
      data: bookings,
      total: bookings.length,
    };
  }

  // =====================================================
  // ADMIN - Venue Statistics
  // =====================================================
  @Get('venue/:venueId/statistics')
  @Roles(UserRole.VENUE_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get venue booking statistics' })
  async getVenueStatistics(@Param('venueId') venueId: string) {
    const stats = await this.bookingsService.getVenueBookingStatistics(venueId);
    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }
}