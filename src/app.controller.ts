// ==========================================
// 📁 src/app.controller.ts - TỐI ƯU
// ==========================================
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

@ApiTags('Health')
@Controller()
export class AppController {
    constructor(private readonly config: ConfigService) { }

    @Get()
    @ApiOperation({ summary: 'API Root' })
    getRoot() {
        return {
            success: true,
            version: this.config.get('app.version') || '1.0.0',
            message: 'Welcome to Dat San 247 API',
            environment: this.config.get('app.env'),
            docs: '/api/docs',
            api: '/api/v1',
            status: 'running',
            timestamp: new Date().toISOString(),
        };
    }

    @Get('health')
    @ApiOperation({ summary: 'Health Check' })
    healthCheck() {
        return {
            status: 'ok',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            memory: process.memoryUsage(),
        };
    }
}