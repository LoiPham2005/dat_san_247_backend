// shared/services/scheduler.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Booking, BookingStatus } from '../../modules/bookings/entities/booking.entity';
import { NotificationsService } from '../../modules/notifications/notifications.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private notificationsService: NotificationsService,
  ) {}

  // Send booking reminders 24 hours before
  @Cron(CronExpression.EVERY_HOUR)
  async sendBookingReminders() {
    this.logger.log('Running booking reminder task');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const upcomingBookings = await this.bookingRepository.find({
      where: {
        bookingDate: tomorrow,
        status: BookingStatus.CONFIRMED,
      },
      relations: ['user', 'court', 'court.venue'],
    });

    for (const booking of upcomingBookings) {
      if (booking.user.fcmToken) {
        await this.notificationsService.sendPushNotification(
          booking.userId,
          booking.user.fcmToken,
          'Nhắc nhở đặt sân',
          `Bạn có lịch chơi vào ngày mai lúc ${booking.startTime} tại ${booking.court.venue.venueName}`,
          {
            type: 'booking_reminder',
            relatedId: booking.id,
            relatedType: 'booking',
          },
        );
      }
    }

    this.logger.log(`Sent ${upcomingBookings.length} booking reminders`);
  }

  // Mark no-show bookings
  @Cron(CronExpression.EVERY_30_MINUTES)
  async markNoShowBookings() {
    this.logger.log('Running no-show check task');

    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const result = await this.bookingRepository
      .createQueryBuilder()
      .update(Booking)
      .set({ status: BookingStatus.NO_SHOW })
      .where('status = :status', { status: BookingStatus.CONFIRMED })
      .andWhere('booking_date < :date', { date: twoHoursAgo })
      .andWhere('checked_in_at IS NULL')
      .execute();

    this.logger.log(`Marked ${result.affected} bookings as no-show`);
  }

  // Auto-complete bookings
  @Cron(CronExpression.EVERY_HOUR)
  async autoCompleteBookings() {
    this.logger.log('Running auto-complete bookings task');

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const result = await this.bookingRepository
      .createQueryBuilder()
      .update(Booking)
      .set({ status: BookingStatus.COMPLETED })
      .where('status = :status', { status: BookingStatus.PLAYING })
      .andWhere("TIMESTAMP(booking_date, end_time) < :time", { time: oneHourAgo })
      .execute();

    this.logger.log(`Auto-completed ${result.affected} bookings`);
  }

  // Clean up old notifications
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldNotifications() {
    this.logger.log('Running notification cleanup task');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Delete read notifications older than 30 days
    const result = await this.notificationsService['notificationRepository']
      .createQueryBuilder()
      .delete()
      .where('is_read = true')
      .andWhere('created_at < :date', { date: thirtyDaysAgo })
      .execute();

    this.logger.log(`Deleted ${result.affected} old notifications`);
  }

  // Calculate daily statistics
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async calculateDailyStats() {
    this.logger.log('Calculating daily statistics');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // You can implement custom statistics calculation here
    // For example: store in a daily_stats table

    this.logger.log('Daily statistics calculated');
  }
}