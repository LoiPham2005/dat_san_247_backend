import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { MailProcessor } from './processors/mail.processor';
import { SmsProcessor } from './processors/sms.processor';
import { NotificationProcessor } from './processors/notification.processor';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password'),
          db: configService.get<number>('redis.queueDb'),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'mail' },
      { name: 'sms' },
      { name: 'notifications' },
    ),
  ],
  providers: [QueueService, MailProcessor, SmsProcessor, NotificationProcessor],
  exports: [BullModule, QueueService],
})
export class QueueModule { }
