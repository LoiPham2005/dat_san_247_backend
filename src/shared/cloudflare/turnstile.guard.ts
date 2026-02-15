import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TurnstileService } from './turnstile.service';

export const CHECK_TURNSTILE_KEY = 'check_turnstile';
export const CheckTurnstile = () => SetMetadata(CHECK_TURNSTILE_KEY, true);

@Injectable()
export class TurnstileGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly turnstileService: TurnstileService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(CHECK_TURNSTILE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = request.body['cf-turnstile-response'] || request.headers['x-turnstile-token'];

        // Auto bypass if in development and no token is provided (to make testing easier)
        // const isProd = process.env.NODE_ENV === 'production';
        // if (!isProd && !token) {
        //     return true;
        // }

        // Get real IP from Cloudflare header if available, fallback to request.ip (which is already fixed by trust proxy)
        const remoteIp = request.headers['cf-connecting-ip'] || request.ip;

        const isValid = await this.turnstileService.verifyToken(token, remoteIp);

        if (!isValid) {
            throw new ForbiddenException('Invalid or expired captcha token');
        }

        return true;
    }
}
