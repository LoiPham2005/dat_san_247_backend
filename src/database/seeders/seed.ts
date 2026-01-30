import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { DatabaseSeeder } from './database.seeder';
import { logger } from '@sentry/nestjs';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(SeederModule);
    const seeder = app.get(DatabaseSeeder);
    try {
        await seeder.onModuleInit();
        logger.info('Seeding complete!');
    } catch (error) {
        logger.error('Seeding failed', error);
    } finally {
        await app.close();
    }
}
bootstrap();
