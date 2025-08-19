import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { getTypeOrmConfig } from './config/database.config';
import { getMailerConfig } from './config/mailer.config';
import { AuthModule } from './modules/auth/auth.module';
import { SportsFieldModule } from './modules/sports-fields/sports-fields.module';
import { DatabaseModule } from './database/database.module';
import { FieldImageModule } from './modules/field-images/field-image.module';
import { BookingModule } from './modules/bookings/booking.module';
import { ReviewModule } from './modules/reviews/review.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { ComplaintModule } from './modules/complaints/complaint.module';
import { FieldAvailabilityModule } from './modules/field-availability/field-availability.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    AuthModule,
    DatabaseModule, // DataInitService đã được cung cấp ở đây
    SportsFieldModule,
    FieldImageModule,
    BookingModule,
    ReviewModule,
    NotificationModule,
    ComplaintModule,
    FieldAvailabilityModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMailerConfig,
    }),
  ],
  // providers: [DataInitService],  ← Xóa dòng này
})
export class AppModule {}
