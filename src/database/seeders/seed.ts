import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { DatabaseSeeder } from './database.seeder';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('SeederBootstrap');
    try {
        const appContext = await NestFactory.createApplicationContext(SeederModule);
        const seeder = appContext.get(DatabaseSeeder);

        await seeder.seed();

        await appContext.close();
        logger.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('Seeding failed', error);
        process.exit(1);
    }
}

bootstrap();
