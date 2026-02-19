// import {
//     WebSocketGateway,
//     WebSocketServer,
//     SubscribeMessage,
//     OnGatewayConnection,
//     OnGatewayDisconnect,
//     ConnectedSocket,
//     MessageBody,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';
// import { UseGuards } from '@nestjs/common';
// import { ChatService } from './chat.service';
// import { WsJwtGuard } from '../../common/guards/ws-jwt.guard';

// @WebSocketGateway({
//     cors: {
//         origin: '*',
//     },
//     namespace: 'chat',
// })
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
//     @WebSocketServer()
//     server: Server;

//     constructor(
//         private readonly jwtService: JwtService,
//         private readonly configService: ConfigService,
//         private readonly chatService: ChatService,
//     ) { }

//     async handleConnection(client: Socket) {
//         try {
//             const token = this.extractTokenFromHeader(client);
//             if (!token) {
//                 client.disconnect();
//                 return;
//             }

//             const payload = this.jwtService.verify(token, {
//                 secret: this.configService.get<string>('auth.jwtSecret'),
//             });

//             client.data.user = payload;
//             client.join(`user_${payload.sub}`);
//             console.log(`Client connected: ${client.id}, User: ${payload.sub}`);
//         } catch (e) {
//             console.error('Connection error:', e.message);
//             client.disconnect();
//         }
//     }

//     handleDisconnect(client: Socket) {
//         console.log(`Client disconnected: ${client.id}`);
//     }

//     @UseGuards(WsJwtGuard)
//     @SubscribeMessage('sendMessage')
//     async handleSendMessage(
//         @ConnectedSocket() client: Socket,
//         @MessageBody() payload: { conversationId: string; content: string; type?: string },
//     ) {
//         const userId = client.data.user.sub;
//         const message = await this.chatService.sendMessage(userId, payload.conversationId, {
//             content: payload.content,
//             type: payload.type as any,
//         });

//         // Emit to conversation room (all participants)
//         this.server.to(`conversation_${payload.conversationId}`).emit('newMessage', message);
//         return message;
//     }

//     @UseGuards(WsJwtGuard)
//     @SubscribeMessage('joinConversation')
//     handleJoinConversation(
//         @ConnectedSocket() client: Socket,
//         @MessageBody() payload: { conversationId: string },
//     ) {
//         client.join(`conversation_${payload.conversationId}`);
//         console.log(`User ${client.data.user.sub} joined conversation ${payload.conversationId}`);
//         return { event: 'joinedConversation', conversationId: payload.conversationId };
//     }

//     @UseGuards(WsJwtGuard)
//     @SubscribeMessage('leaveConversation')
//     handleLeaveConversation(
//         @ConnectedSocket() client: Socket,
//         @MessageBody() payload: { conversationId: string },
//     ) {
//         client.leave(`conversation_${payload.conversationId}`);
//         return { event: 'leftConversation', conversationId: payload.conversationId };
//     }

//     @UseGuards(WsJwtGuard)
//     @SubscribeMessage('typing')
//     handleTyping(
//         @ConnectedSocket() client: Socket,
//         @MessageBody() payload: { conversationId: string; isTyping: boolean },
//     ) {
//         client.to(`conversation_${payload.conversationId}`).emit('userTyping', {
//             userId: client.data.user.sub,
//             isTyping: payload.isTyping,
//             conversationId: payload.conversationId,
//         });
//     }

//     private extractTokenFromHeader(client: Socket): string | undefined {
//         const [type, token] = client.handshake.headers.authorization?.split(' ') ?? [];
//         return type === 'Bearer' ? token : undefined;
//     }
// }
