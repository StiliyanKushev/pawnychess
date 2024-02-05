import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'redis/redis.module';
import { DatabaseModule } from './database/database.module';
import { IamModule } from './iam/iam.module';
import { LoggingModule } from './logging/logging.module';
import { UsersModule } from './users/users.module';
import { ValidationModule } from './validation/validation.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    LoggingModule.forRoot(),
    DatabaseModule.forRoot(),
    RedisModule.forRoot(),
    ValidationModule.forRoot(),
    UsersModule,
    IamModule,
    ValidationModule,
    LoggingModule,
  ],
})
export class AppModule {}
