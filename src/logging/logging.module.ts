import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import loggingConfig from './config/logging.config';

@Module({})
export class LoggingModule {
  static forRoot(): DynamicModule {
    return {
      module: LoggingModule,
      imports: [
        LoggerModule.forRootAsync({
          imports: [ConfigModule.forFeature(loggingConfig)],
          inject: [loggingConfig.KEY],
          useFactory: async (logConfig: ConfigType<typeof loggingConfig>) => ({
            pinoHttp: {
              customProps: () => ({
                context: 'NETWORK',
              }),
              transport: {
                target: 'pino-pretty',
                options: {
                  minimumLevel: logConfig.minimumLevel,
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
        }),
      ],
    };
  }
}
