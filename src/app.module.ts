import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'redis/redis.module';
import { DatabaseModule } from './database/database.module';
import { IamModule } from './iam/iam.module';
import { UsersModule } from './users/users.module';
import { ValidationModule } from './validation/validation.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule.forRoot(),
    RedisModule.forRoot(),
    ValidationModule.forRoot(),
    UsersModule,
    IamModule,
    ValidationModule,
  ],
})
export class AppModule {}
