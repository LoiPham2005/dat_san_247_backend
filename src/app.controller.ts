// ==========================================
// 📁 src/app.controller.ts - TỐI ƯU
// ==========================================
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
    @Get()
    @ApiOperation({ summary: 'API Root' })
    getRoot() {
        return {
            success: true,
            message: 'Welcome to Dat San 247 API',
            version: '1.0.0',
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
            version: '1.0.0',   
            docs: '/api/docs',  
            api: '/api/v1', 
            timestamp: new Date().toISOString(),
        };
    }
}