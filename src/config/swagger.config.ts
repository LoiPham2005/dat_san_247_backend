// ==========================================
// 📁 src/config/swagger.config.ts - MỚI (Tách Swagger)
// ==========================================
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
    const config = new DocumentBuilder()
        .setTitle('Đặt Sân 247 API')
        .setDescription('Sports Venue Booking Platform API')
        .setVersion('1.0.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
            'access-token',
        )
        .addTag('Auth', 'Authentication')
        .addTag('Users', 'User management')
        .addTag('Venues', 'Venue management')
        .addTag('Bookings', 'Booking management')
        .addTag('Payments', 'Payments')
        .addTag('Reviews', 'Reviews')
        .addTag('Health', 'Health checks')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
}