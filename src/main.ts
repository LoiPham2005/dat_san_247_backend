import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // =====================================================
  // SECURITY MIDDLEWARE
  // =====================================================
  app.use(helmet());
  app.use(compression());

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  });

  // =====================================================
  // GLOBAL VALIDATION PIPE
  // =====================================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // =====================================================
  // API VERSIONING
  // =====================================================
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // =====================================================
  // SWAGGER DOCUMENTATION
  // =====================================================
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
    .addServer(process.env.API_URL || 'http://localhost:3000', 'Development')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Venues', 'Venue management endpoints')
    .addTag('Courts', 'Court management endpoints')
    .addTag('Bookings', 'Booking management endpoints')
    .addTag('Payments', 'Payment endpoints')
    .addTag('Reviews', 'Review endpoints')
    .addTag('Notifications', 'Notification endpoints')
    .addTag('Staff Management', 'Staff management endpoints')
    .addTag('Admin', 'Admin endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
      deepLinking: true,
    },
    customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css',
  });

  // =====================================================
  // GLOBAL PREFIX & PORT
  // =====================================================
  const port = process.env.PORT || 3000;
  const globalPrefix = 'api';

  app.setGlobalPrefix(globalPrefix);

  // =====================================================
  // START SERVER
  // =====================================================
  await app.listen(port, '0.0.0.0', () => {
    console.log('\n');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║  🚀 SERVER STARTED SUCCESSFULLY            ║');
    console.log('╠════════════════════════════════════════════╣');
    console.log(`║  🌐 API URL: http://localhost:${port}         ║`);
    console.log(`║  📚 Docs: http://localhost:${port}/api/docs   ║`);
    console.log('╚════════════════════════════════════════════╝');
    console.log('\n');
  });
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start application:', err);
  process.exit(1);
});