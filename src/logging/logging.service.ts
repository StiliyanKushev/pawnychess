import { INestApplication, Injectable } from '@nestjs/common';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

@Injectable()
export class LoggingService {
  /**
   * Setup function expected to be called in the
   * bootstrapping phase that will setup additional
   * configuration to enable the custom logger.
   */
  /* istanbul ignore next */
  setup(app: INestApplication): void {
    app.useLogger(app.get(Logger));
    app.useGlobalInterceptors(new LoggerErrorInterceptor());
  }
}
