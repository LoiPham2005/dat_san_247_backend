import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { DatabaseSeeder } from './database.seeder';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(SeederModule);
    const seeder = app.get(DatabaseSeeder);
    try {
        await seeder.onModuleInit();
        console.log('Seeding complete!');
    } catch (error) {
        console.error('Seeding failed', error);
    } finally {
        await app.close();
    }
}
bootstrap();
