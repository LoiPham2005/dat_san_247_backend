// modules/cron/cron.controller.ts
import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SchedulerService } from '../../shared/services/scheduler.service';

@ApiTags('Cron Jobs')
@Controller('cron')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class CronController {
  constructor(private schedulerService: SchedulerService) {}

  @Post('send-reminders')
  @ApiOperation({ summary: 'Manually trigger booking reminders' })
  async triggerReminders() {
    await this.schedulerService.sendBookingReminders();
    return { message: 'Reminders sent' };
  }

  @Post('mark-no-show')
  @ApiOperation({ summary: 'Manually trigger no-show marking' })
  async triggerNoShow() {
    await this.schedulerService.markNoShowBookings();
    return { message: 'No-show bookings marked' };
  }

  @Post('auto-complete')
  @ApiOperation({ summary: 'Manually trigger auto-complete' })
  async triggerAutoComplete() {
    await this.schedulerService.autoCompleteBookings();
    return { message: 'Bookings auto-completed' };
  }

  @Post('cleanup-notifications')
  @ApiOperation({ summary: 'Manually trigger notification cleanup' })
  async triggerCleanup() {
    await this.schedulerService.cleanupOldNotifications();
    return { message: 'Old notifications cleaned up' };
  }
}