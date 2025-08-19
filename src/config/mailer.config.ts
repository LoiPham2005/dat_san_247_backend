import { ConfigService } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';

export const getMailerConfig = async (configService: ConfigService): Promise<MailerOptions> => ({
  transport: {
    host: configService.get<string>('MAIL_HOST'),
    secure: false,
    auth: {
      user: configService.get<string>('MAIL_USER'),
      pass: configService.get<string>('MAIL_PASSWORD'),
    },
  },
  defaults: {
    from: configService.get<string>('MAIL_FROM'),
  },
});
