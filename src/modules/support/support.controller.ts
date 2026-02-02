import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';
import { SupportTicket } from './entities/support-ticket.entity';

@ApiTags('Client - Support')
@Controller('support')
export class SupportController {
    constructor(private readonly supportService: SupportService) { }

    @Post('tickets')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Tạo yêu cầu hỗ trợ mới' })
    @ApiSuccessResponse(SupportTicket)
    async createTicket(@CurrentUser('id') userId: string, @Body() data: any) {
        return this.supportService.createTicket({
            ...data,
            userId,
        });
    }

    @Post('contact')
    @ApiOperation({ summary: 'Gửi liên hệ (Public)' })
    @ApiSuccessResponse()
    async submitContact(@Body() data: any) {
        return this.supportService.createTicket({
            ...data,
            title: `Contact: ${data.subject}`,
            description: `From: ${data.name} <${data.email}>\n\nMessage: ${data.message}`,
            priority: 'LOW',
            status: 'OPEN',
        });
    }
}
