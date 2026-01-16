// import { Module, Global } from '@nestjs/common';
// import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import KeyvRedis from '@keyv/redis';
// import { CacheService } from './cache.service';

// @Global()
// @Module({
//   imports: [
//     NestCacheModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: async (configService: ConfigService) => {
//         return {
//           stores: [
//             new KeyvRedis({
//               host: configService.get<string>('redis.host'),
//               port: configService.get<number>('redis.port'),
//               password: configService.get<string>('redis.password'),
//               db: configService.get<number>('redis.db'),
//             }),
//           ],
//           ttl: configService.get<number>('redis.ttl'),
//         };
//       },
//     }),
//   ],
//   providers: [CacheService],
//   exports: [NestCacheModule, CacheService],
// })
// export class CacheModule { }



import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = `redis://:${configService.get<string>('redis.password')}@${configService.get<string>('redis.host')}:${configService.get<number>('redis.port')}/${configService.get<number>('redis.db')}`;

        return {
          stores: [
            new KeyvRedis(redisUrl),
          ],
          ttl: configService.get<number>('redis.ttl'),
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [NestCacheModule, CacheService],
})
export class CacheModule {}
