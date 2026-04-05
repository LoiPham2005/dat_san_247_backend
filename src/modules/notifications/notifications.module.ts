import { Global, Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationGateway } from './gateways/notification.gateway';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { CustomerController } from './controllers/customer.controller';
import { AdminController } from './controllers/admin.controller';

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [CustomerController, AdminController],
  providers: [
    NotificationsService,
    NotificationGateway,
  ],
  exports: [NotificationsService, NotificationGateway],
})
export class NotificationsModule {}
