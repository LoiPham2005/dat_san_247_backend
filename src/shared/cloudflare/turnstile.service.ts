import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TurnstileService {
    private readonly logger = new Logger(TurnstileService.name);
    private readonly secretKey: string;
    private readonly siteVerifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        this.secretKey = this.configService.get<string>('cloudflare.turnstile.secretKey') || '';
    }

    async verifyToken(token: string, remoteIp?: string): Promise<boolean> {
        if (!this.secretKey) {
            this.logger.warn('Cloudflare Turnstile Secret Key is not configured. Skipping verification.');
            return true; // Or false, depending on your policy. Usually false for security.
        }

        if (!token) {
            return false;
        }

        try {
            const params = new URLSearchParams();
            params.append('secret', this.secretKey);
            params.append('response', token);
            if (remoteIp) {
                params.append('remoteip', remoteIp);
            }

            const response = await firstValueFrom(
                this.httpService.post(
                    this.siteVerifyUrl,
                    params.toString(),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    },
                ),
            );

            const { success, 'error-codes': errorCodes } = response.data;

            if (!success) {
                this.logger.error(`Turnstile verification failed: ${JSON.stringify(errorCodes)}`);
                return false;
            }

            return true;
        } catch (error) {
            this.logger.error('Error during Turnstile verification', error.stack);
            return false;
        }
    }
}
