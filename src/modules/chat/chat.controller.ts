import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('conversations')
    @ApiOperation({ summary: 'Create a new conversation' })
    async createConversation(@Request() req, @Body() data: any) {
        return this.chatService.createConversation(req.user.id, data);
    }

    @Get('conversations')
    @ApiOperation({ summary: 'Get my conversations' })
    async getMyConversations(@Request() req) {
        return this.chatService.getUserConversations(req.user.id);
    }

    @Get('conversations/:id')
    @ApiOperation({ summary: 'Get conversation details' })
    async getConversation(@Request() req, @Param('id') conversationId: string) {
        return this.chatService.getConversationById(conversationId, req.user.id);
    }

    @Post('conversations/:id/messages')
    @ApiOperation({ summary: 'Send a message' })
    async sendMessage(
        @Request() req,
        @Param('id') conversationId: string,
        @Body() data: any
    ) {
        return this.chatService.sendMessage(req.user.id, conversationId, data);
    }

    @Get('conversations/:id/messages')
    @ApiOperation({ summary: 'Get messages' })
    async getMessages(
        @Request() req,
        @Param('id') conversationId: string,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
    ) {
        return this.chatService.getMessages(conversationId, req.user.id, limit, offset);
    }

    @Post('conversations/:id/read')
    @ApiOperation({ summary: 'Mark conversation as read' })
    async markAsRead(
        @Request() req,
        @Param('id') conversationId: string,
        @Body('messageId') messageId: string
    ) {
        return this.chatService.markAsRead(conversationId, req.user.id, messageId);
    }

    @Post('messages/:id/react')
    @ApiOperation({ summary: 'React to a message' })
    async reactToMessage(
        @Request() req,
        @Param('id') messageId: string,
        @Body('emoji') emoji: string
    ) {
        return this.chatService.reactToMessage(req.user.id, messageId, emoji);
    }

    @Put('messages/:id')
    @ApiOperation({ summary: 'Edit a message' })
    async editMessage(
        @Request() req,
        @Param('id') messageId: string,
        @Body('content') content: string
    ) {
        return this.chatService.editMessage(messageId, req.user.id, content);
    }

    @Delete('messages/:id')
    @ApiOperation({ summary: 'Delete a message' })
    async deleteMessage(
        @Request() req,
        @Param('id') messageId: string,
        @Query('forEveryone') forEveryone?: boolean
    ) {
        return this.chatService.deleteMessage(messageId, req.user.id, forEveryone === true);
    }
}
