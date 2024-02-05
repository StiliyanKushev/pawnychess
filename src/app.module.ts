import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configSchema } from 'config.schema';
import { RedisModule } from 'redis/redis.module';
import { DatabaseModule } from './database/database.module';
import { IamModule } from './iam/iam.module';
import { LoggingModule } from './logging/logging.module';
import { SwaggerSetupModule } from './swagger-setup/swagger-setup.module';
import { UsersModule } from './users/users.module';
import { ValidationModule } from './validation/validation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: configSchema,
    }),
    LoggingModule.forRoot(),
    DatabaseModule.forRoot(),
    RedisModule.forRoot(),
    ValidationModule.forRoot(),
    UsersModule,
    IamModule,
    ValidationModule,
    LoggingModule,
    SwaggerSetupModule,
  ],
})
export class AppModule {}
