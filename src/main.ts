// ==========================================
// 📁 src/main.ts - TỐI ƯU
// ==========================================
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import * as Sentry from '@sentry/nestjs';

import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TrimPipe } from './common/pipes/trim.pipe';

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

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'], // Default, but Winston will override if injected properly via app.useLogger
    });

    // Cloudflare & Proxy Support
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', true);

    // Use Winston for system logs
    const { WINSTON_MODULE_NEST_PROVIDER } = await import('nest-winston');
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

    const config = app.get(ConfigService);


    // Security & Performance
    app.use(helmet());
    app.use(compression());
    app.enableCors({
        origin: config.get('app.corsOrigins'),
        credentials: true,
    });

    // Versioning
    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    // Global config
    app.setGlobalPrefix('api'); // Removed v1 because versioning handles it
    // app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

    // Global Pipes
    app.useGlobalPipes(
        new TrimPipe(), // Custom pipe to trim strings
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // Global Filters
    app.useGlobalFilters(
        new AllExceptionsFilter(),
        new HttpExceptionFilter(),
    );

    // Global Interceptors
    // Global Interceptors
    app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));

    // Enable shutdown hooks for graceful shutdown
    app.enableShutdownHooks();

    // Swagger (dev only)
    if (config.get('app.env') !== 'production') {
        setupSwagger(app);
    }

    // Start server
    const port = config.get('app.port') || 3000;
    const env = config.get('app.env') || 'development';

    await app.listen(port, '0.0.0.0', () => {
        const lines = [
            `🌍 Environment: ${env}`,
            `🌐 API URL:     http://localhost:${port}/api/v1`,
            `📚 Swagger Docs: http://localhost:${port}/api/docs`
        ];

        const title = '🚀 SERVER STARTED SUCCESSFULLY';
        const maxLength = Math.max(title.length, ...lines.map(l => l.length));
        const border = '═'.repeat(maxLength + 4);

        logger.log('\n');
        logger.log(`╔${border}╗`);
        logger.log(`║  ${title.padEnd(maxLength)}  ║`);
        logger.log(`╠${border}╣`);
        lines.forEach(line => {
            logger.log(`║  ${line.padEnd(maxLength)}  ║`);
        });
        logger.log(`╚${border}╝`);
        logger.log('\n');
    });

    // await app.listen(port, '0.0.0.0', () => {
    //     logger.log('\n');
    //     logger.log('╔══════════════════════════════════════════════════╗');
    //     logger.log('║  🚀 SERVER STARTED SUCCESSFULLY                  ║');
    //     logger.log('╠══════════════════════════════════════════════════╣');
    //     logger.log(`║  🌍 Environment: ${env.toUpperCase()}                     ║`);
    //     logger.log(`║  🌐 API URL: http://localhost:${port}/api/v1        ║`);
    //     logger.log(`║  📚 Swagger Docs: http://localhost:${port}/api/docs ║`);
    //     logger.log('╚══════════════════════════════════════════════════╝');
    //     logger.log('\n');
    // });

}

bootstrap().catch((err) => {
    console.error('❌ BOOTSTRAP ERROR:');
    console.dir(err, { depth: null });
    if (err instanceof Error) {
        console.error('❌ STACK:', err.stack);
    }
    Sentry.captureException(err);
    process.exit(1);
});
