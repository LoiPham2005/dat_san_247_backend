import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  app.setGlobalPrefix('api'); // <- Thêm dòng này

  // Global Pipes
  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
