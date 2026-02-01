import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { ConversationParticipant } from './entities/participant.entity';
import { Message } from './entities/message.entity';
import { SupportTicket } from './entities/support-ticket.entity';
import { ChatTemplate } from './entities/chat-template.entity';
import { ChatSettings, ChatBlock } from './entities/chat-settings.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { WsJwtGuard } from '../../common/guards/ws-jwt.guard';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Conversation,
            ConversationParticipant,
            Message,
            SupportTicket,
            ChatTemplate,
            ChatSettings,
            ChatBlock,
        ]),
        JwtModule,
        ConfigModule,
    ],
    providers: [ChatService, ChatGateway, WsJwtGuard],
    controllers: [ChatController],
    exports: [ChatService],
})
export class ChatModule { }
