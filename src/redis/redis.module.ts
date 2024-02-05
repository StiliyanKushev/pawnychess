import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import redisConfig from './config/redis.config';
import { RedisService } from './redis.service';

@Module({})
export class RedisModule {
  static forRoot(): DynamicModule {
    return {
      module: RedisModule,
      global: true,
      imports: [ConfigModule.forFeature(redisConfig)],
      providers: [RedisService],
      exports: [RedisService],
    };
  }
}
