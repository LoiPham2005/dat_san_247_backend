import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';

import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // =====================================================
    // SECURITY & PERFORMANCE
    // =====================================================
    app.use(helmet());
    app.use(compression());
    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    // =====================================================
    // GLOBAL CONFIGURATION
    // =====================================================
    app.setGlobalPrefix('api');

    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

    // =====================================================
    // SWAGGER DOCUMENTATION
    // =====================================================
    if (configService.get('app.env') !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('Đặt Sân 247 API')
            .setDescription('API Documentation for Dat San 247 Backend')
            .setVersion('1.0.0')
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    name: 'JWT',
                    description: 'Enter JWT token',
                    in: 'header',
                },
                'access-token',
            )
            .addTag('Auth', 'Authentication endpoints')
            .addTag('Users', 'User management endpoints')
            .addTag('Roles', 'Role management endpoints')
            .addTag('Permissions', 'Permission management endpoints')
            .addTag('Venues', 'Venue management endpoints')
            .addTag('Courts', 'Court management endpoints')
            .addTag('Bookings', 'Booking management endpoints')
            .addTag('Payments', 'Payment endpoints')
            .addTag('Reviews', 'Review endpoints')
            .addTag('Notifications', 'Notification endpoints')
            .addTag('Dashboard', 'Dashboard endpoints')
            .addTag('Support', 'Staff support endpoints')
            .build();

        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                displayOperationId: true,
                deepLinking: true,
            },
        });
    }

    // =====================================================
    // START SERVER
    // =====================================================
    const port = configService.get<number>('app.port') || 3000;

    await app.listen(port, '0.0.0.0', () => {
        logger.log('\n');
        logger.log('╔════════════════════════════════════════════╗');
        logger.log('║  🚀 SERVER STARTED SUCCESSFULLY            ║');
        logger.log('╠════════════════════════════════════════════╣');
        logger.log(`║  🌐 API URL: http://localhost:${port}/api/v1  ║`);
        logger.log(`║  📚 Docs: http://localhost:${port}/api/docs   ║`);
        logger.log('╚════════════════════════════════════════════╝');
        logger.log('\n');
    });
}

bootstrap().catch((err) => {
    const logger = new Logger('Bootstrap');
    logger.error('❌ Failed to start application:', err);
    process.exit(1);
});