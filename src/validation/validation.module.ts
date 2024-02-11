import { DynamicModule, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

/**
 * Export one instance that'll also be used during ws gateway initialization.
 */
export const GlobalValidationPipe = new ValidationPipe({
  transform: true,
  forbidUnknownValues: true,
  forbidNonWhitelisted: true,
  whitelist: true,
});

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
          useValue: GlobalValidationPipe,
        },
      ],
    };
  }
}
