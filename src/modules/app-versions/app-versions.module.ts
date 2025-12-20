import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppVersion } from './entities/app-version.entity';
import { AppVersionsService } from './app-version.service';
import { AppVersionsController } from './app-version.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AppVersion])],
  controllers: [AppVersionsController],
  providers: [AppVersionsService],
  exports: [AppVersionsService],
})
export class AppVersionsModule { }