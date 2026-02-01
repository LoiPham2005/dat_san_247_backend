import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = this.extractTokenFromHeader(client);
            if (!token) {
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>('auth.jwtSecret'),
            });

            client.data.user = payload;
            client.join(`user_${payload.sub}`); // Join room "user_{userId}"
            console.log(`Notification Client connected: ${client.id}, User: ${payload.sub}`);
        } catch (e) {
            console.error('Notification Connection error:', e.message);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Notification Client disconnected: ${client.id}`);
    }

    sendToUser(userId: string, event: string, data: any) {
        this.server.to(`user_${userId}`).emit(event, data);
    }

    sendToAll(event: string, data: any) {
        this.server.emit(event, data);
    }

    private extractTokenFromHeader(client: Socket): string | undefined {
        const [type, token] = client.handshake.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
