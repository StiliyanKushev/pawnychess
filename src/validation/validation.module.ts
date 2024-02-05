import { DynamicModule, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

@Module({})
export class ValidationModule {
  static forRoot(): DynamicModule {
    return {
      module: ValidationModule,
      providers: [
        /**
         * register transforming validation pipe globally
         */
        {
          provide: APP_PIPE,
          useValue: new ValidationPipe({
            transform: true,
            forbidUnknownValues: true,
            forbidNonWhitelisted: true,
            whitelist: true,
          }),
        },
      ],
    };
  }
}
