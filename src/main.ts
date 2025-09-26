import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { FileUploadInterceptor } from './common/interceptors/file-upload.interceptor';
import { join } from 'path'; // <-- Quan trọng

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  app.setGlobalPrefix('api');

  // Global Pipes
  app.useGlobalPipes(new ValidationPipe());

  // Đăng ký interceptor cho toàn bộ project
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Đăng ký filter cho toàn bộ app
  app.useGlobalFilters(new AllExceptionsFilter());

  // Dùng global interceptor để log mọi request
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Add global file upload interceptor
  app.useGlobalInterceptors(new FileUploadInterceptor());

  // Cấu hình upload limit
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Serve thư mục uploads => Cực quan trọng
  // app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // // Tạo thư mục uploads và uploads/banners nếu chưa tồn tại
  // const fs = require('fs');
  // if (!fs.existsSync('./uploads')) {
  //   fs.mkdirSync('./uploads');
  // }
  // if (!fs.existsSync('./uploads/banners')) {
  //   fs.mkdirSync('./uploads/banners');
  // }

  // Enable CORS
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
