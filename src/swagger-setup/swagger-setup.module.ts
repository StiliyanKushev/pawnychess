import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import swaggerConfig from './config/swagger.config';
import { SwaggerSetupService } from './swagger-setup.service';

@Module({})
export class SwaggerSetupModule {
  static forRoot(): DynamicModule {
    return {
      module: SwaggerSetupModule,
      imports: [ConfigModule.forFeature(swaggerConfig)],
      providers: [SwaggerSetupService],
      exports: [SwaggerSetupService],
    };
  }
}
