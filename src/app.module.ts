import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContextIdFactory } from '@nestjs/core';
import { configSchema } from 'config.schema';
import { AggregateByLocaleContextIdStrategy } from 'core/aggregate-by-locale.strategy';
import { I18nModule } from 'i18n/i18n.module';
import { RedisModule } from 'redis/redis.module';
import { DatabaseModule } from './database/database.module';
import { IamModule } from './iam/iam.module';
import { LoggingModule } from './logging/logging.module';
import { SwaggerSetupModule } from './swagger-setup/swagger-setup.module';
import { UsersModule } from './users/users.module';
import { ValidationModule } from './validation/validation.module';

ContextIdFactory.apply(new AggregateByLocaleContextIdStrategy());

@Module({
  imports: [
    /**
     * import all globally scoped core modules
     */
    ConfigModule.forRoot({ validationSchema: configSchema }),
    LoggingModule.forRoot(),
    DatabaseModule.forRoot(),
    RedisModule.forRoot(),
    I18nModule.forRoot(),
    ValidationModule.forRoot(),
    SwaggerSetupModule,

    /**
     * import all feature modules
     */
    UsersModule,
    IamModule,
  ],
})
export class AppModule {}
