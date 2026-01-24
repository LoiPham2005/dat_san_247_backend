import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('conversations')
    @ApiOperation({ summary: 'Tạo cuộc trò truyện mới' })
    async createConversation(@CurrentUser('id') userId: string, @Body() data: any) {
        return this.chatService.createConversation(userId, data);
    }

    @Get('conversations')
    @ApiOperation({ summary: 'Danh sách cuộc trò chuyện của tôi' })
    async getMyConversations(@CurrentUser('id') userId: string) {
        return this.chatService.getMyConversations(userId);
    }

    @Post('messages')
    @ApiOperation({ summary: 'Gửi tin nhắn' })
    async sendMessage(@CurrentUser('id') userId: string, @Body() data: any) {
        return this.chatService.sendMessage(userId, data);
    }

    @Get('conversations/:id/messages')
    @ApiOperation({ summary: 'Lấy tin nhắn trong cuộc trò chuyện' })
    async getMessages(
        @Param('id') conversationId: string,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
    ) {
        return this.chatService.getMessages(conversationId, limit, offset);
    }
}
