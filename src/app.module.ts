import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { RedisModule } from 'redis/redis.module';
import { DatabaseModule } from './database/database.module';
import { IamModule } from './iam/iam.module';
import { UsersModule } from './users/users.module';
import { ValidationModule } from './validation/validation.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: () => ({
          context: 'HTTP',
        }),
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            messageFormat:
              '[{context}]{if req.method}:' +
              ' [{req.remoteAddress}] [{req.method}] [{req.url}]' +
              ' | [{res.statusCode}] - [{responseTime}ms]' +
              '{end}: {msg}',
            ignore: 'pid,hostname,context,req,res,responseTime',
          },
        },
      },
    }),
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
