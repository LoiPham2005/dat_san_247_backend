import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global prefixes
    app.setGlobalPrefix('api/v1');

    // Global pipes
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

    // Global interceptors
    app.useGlobalInterceptors(new TransformInterceptor());

    // Global filters
    app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

    // Cors
    app.enableCors();

    await app.listen(process.env.PORT || 3000);
}
bootstrap();
