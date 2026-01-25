import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiSuccessResponse } from '../../common/decorators/api-response.decorator';
import { Ticket } from './entities/ticket.entity';

@ApiTags('Client - Support')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support')
export class SupportController {
    constructor(private readonly supportService: SupportService) { }

    @Post('tickets')
    @ApiOperation({ summary: 'Tạo yêu cầu hỗ trợ mới' })
    @ApiSuccessResponse(Ticket)
    async createTicket(@CurrentUser('id') userId: string, @Body() data: any) {
        return this.supportService.createTicket({
            ...data,
            userId,
        });
    }
}
