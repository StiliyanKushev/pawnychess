import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ContextIdFactory } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { configSchema } from 'config.schema';
import { AggregateByLocaleContextIdStrategy } from 'core/aggregate-by-locale.strategy';
import { I18nModule } from 'i18n/i18n.module';
import { RedisModule } from 'redis/redis.module';
import { DatabaseModule } from './database/database.module';
import { GameplayModule } from './gameplay/gameplay.module';
import { GamesModule } from './games/games.module';
import { IamModule } from './iam/iam.module';
import { LoggingModule } from './logging/logging.module';
import { MatchmakingQueueModule } from './matchmaking-queue/matchmaking-queue.module';
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
    EventEmitterModule.forRoot(),
    SwaggerSetupModule.forRoot(),

    /**
     * import all feature modules
     */
    UsersModule,
    IamModule,
    MatchmakingQueueModule,
    GameplayModule,
    GamesModule,
  ],
})
export class AppModule {}
