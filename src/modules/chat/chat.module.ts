import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { Conversation } from './entities/conversation.entity';
import { ConversationParticipant } from './entities/participant.entity';
import { Message } from './entities/message.entity';
import { MessageReceipt } from './entities/message-receipt.entity';
import { MessageReaction } from './entities/message-reaction.entity';
import { ChatSettings } from './entities/chat-settings.entity';
import { ChatTemplate } from './entities/chat-template.entity';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { WsJwtGuard } from '../../common/guards/ws-jwt.guard';

@Module({
    imports: [
        ConfigModule,
        JwtModule,
    ],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway, WsJwtGuard],
    exports: [ChatService],
})
export class ChatModule { }
