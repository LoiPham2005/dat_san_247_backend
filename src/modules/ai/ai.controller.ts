import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('AI Features')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AIController {
    constructor(private readonly aiService: AIService) { }

    @Get('bots')
    @ApiOperation({ summary: 'Lấy danh sách các AI Bot' })
    async findAllBots() {
        return this.aiService.findAllBots();
    }

    @Get('bots/:id')
    @ApiOperation({ summary: 'Chi tiết AI Bot' })
    async findBotById(@Param('id') id: string) {
        return this.aiService.findBotById(id);
    }
}
