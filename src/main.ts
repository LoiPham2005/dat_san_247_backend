import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  app.setGlobalPrefix('api'); // <- Thêm dòng này

  // Global Pipes
  app.useGlobalPipes(new ValidationPipe());

  // Đăng ký interceptor cho toàn bộ project
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Đăng ký filter cho toàn bộ app
  app.useGlobalFilters(new AllExceptionsFilter());


  // Dùng global interceptor để log mọi request
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Enable CORS
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
