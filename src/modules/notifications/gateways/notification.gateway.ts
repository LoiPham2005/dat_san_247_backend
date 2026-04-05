import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*', // Trong production nên để domain cụ thể
  },
  namespace: 'notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  
  // Lưu trữ mapping giữa userId và socketId
  // userId -> Set<socketId> (Một user có thể đăng nhập trên nhiều tab/thiết bị)
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // 1. Lấy token từ handshake (auth hoặc query)
      const token = client.handshake.auth?.token || client.handshake.query?.token as string;
      
      if (!token) {
        client.disconnect();
        return;
      }

      // 2. Verify JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const userId = payload.sub || payload.userId;
      
      if (!userId) {
        client.disconnect();
        return;
      }

      // 3. Lưu socketId vào mapping
      let sockets = this.userSockets.get(userId);
      if (!sockets) {
        sockets = new Set();
        this.userSockets.set(userId, sockets);
      }
      sockets.add(client.id);

      // Join room riêng của user để dễ dàng gửi thông báo sau này
      client.join(`user_${userId}`);
      
      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
    } catch (error) {
      this.logger.error(`Connection verification failed: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Xóa socketId khỏi mapping khi disconnect
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
        break;
      }
    }
  }

  /**
   * Gửi thông báo tới một người dùng cụ thể (Realtime)
   */
  sendNotificationToUser(userId: string, notification: any) {
    // Gửi tới Room của user đó (Bao gồm tất cả các socketId của user đó đang online)
    this.server.to(`user_${userId}`).emit('new_notification', notification);
    this.logger.debug(`Notification sent to user_${userId}: ${notification.title}`);
  }

  /**
   * Gửi thông báo tới tất cả người dùng (Thông báo hệ thống)
   */
  broadcastNotification(notification: any) {
    this.server.emit('system_notification', notification);
    this.logger.debug(`Broadcast notification: ${notification.title}`);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket) {
    return { event: 'pong', data: 'Server is alive!' };
  }
}
