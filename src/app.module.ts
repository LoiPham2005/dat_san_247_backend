import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // để ConfigService dùng ở bất kỳ đâu mà không cần import lại
    }),
  ]
})
export class AppModule { }
