import {
    Injectable,
    CanActivate,
    ExecutionContext,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client = context.switchToWs().getClient();

            // JWT thường nằm ở handhsake query hoặc headers
            const token = client.handshake?.query?.token || client.handshake?.headers?.authorization?.split(' ')[1];

            if (!token) {
                throw new WsException('Missing web socket token');
            }

            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            // Gán thông tin user vào context request của socket
            context.switchToWs().getData().user = payload;

            // Hoặc gán vào socket client object
            client.user = payload;

            return true;
        } catch (error) {
            throw new WsException('Unauthorized web socket connection');
        }
    }
}
