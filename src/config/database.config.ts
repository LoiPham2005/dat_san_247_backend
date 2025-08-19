import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../modules/auth/entities/user.entity';
import { RefreshToken } from '../modules/auth/entities/refresh-token.entity';
import { SportsField } from 'src/modules/sports-fields/entities/sports-fields.entities';
import { FieldImageModule } from 'src/modules/field-images/field-image.module';
import { BookingModule } from 'src/modules/bookings/booking.module';
import { ReviewModule } from 'src/modules/reviews/review.module';
import { NotificationModule } from 'src/modules/notifications/notification.module';
import { ComplaintModule } from 'src/modules/complaints/complaint.module';
import { FieldAvailabilityModule } from 'src/modules/field-availability/field-availability.module';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [
        User, 
        RefreshToken, 
        SportsField, 
        FieldImageModule,
        BookingModule,
        ReviewModule,
        NotificationModule,
        ComplaintModule,
        FieldAvailabilityModule
    ],
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
    autoLoadEntities: true,
});
