// ==========================================
// 📁 src/main.ts - TỐI ƯU
// ==========================================
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import * as Sentry from '@sentry/nestjs';

import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    // Initialize Sentry
    const dsn = process.env.SENTRY_DSN;
    if (dsn) {
        Sentry.init({
            dsn,
            environment: process.env.NODE_ENV || 'development',
            tracesSampleRate: 1.0,
        });
        logger.log('✅ Sentry initialized');
    }

    const app = await NestFactory.create(AppModule);
    const config = app.get(ConfigService);

    // Security & Performance
    app.use(helmet());
    app.use(compression());
    app.enableCors({
        origin: config.get('app.corsOrigins'),
        credentials: true,
    });

    // Global config
    app.setGlobalPrefix('api/v1');
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

    // Swagger (dev only)
    if (config.get('app.env') !== 'production') {
        setupSwagger(app);
    }

    // Start server
    const port = config.get('app.port') || 3000;

    await app.listen(port, '0.0.0.0', () => {
        logger.log('\n');
        logger.log('╔══════════════════════════════════════════════════╗');
        logger.log('║  🚀 SERVER STARTED SUCCESSFULLY                  ║');
        logger.log('╠══════════════════════════════════════════════════╣');
        logger.log(`║  🌐 API URL: http://localhost:${port}/api/v1        ║`);
        logger.log(`║  📚 Swagger Docs: http://localhost:${port}/api/docs ║`);
        logger.log('╚══════════════════════════════════════════════════╝');
        logger.log('\n');
    })

}

bootstrap().catch((err) => {
    Logger.error('❌ Failed to start:', err);
    Sentry.captureException(err);
    process.exit(1);
});


