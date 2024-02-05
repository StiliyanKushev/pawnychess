import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import swaggerConfig from './config/swagger.config';
import { SwaggerSetupService } from './swagger-setup.service';

@Module({
  imports: [ConfigModule.forFeature(swaggerConfig)],
  providers: [SwaggerSetupService],
  exports: [SwaggerSetupService],
})
export class SwaggerSetupModule {}
