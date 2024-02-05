import { NestFactory } from '@nestjs/core';
import { LoggingService } from 'logging/logging.service';
import { SwaggerSetupService } from 'swagger-setup/swagger-setup.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // setup additional configurations required by core modules
  app.get(LoggingService).setup(app);
  app.get(SwaggerSetupService).setup(app);

  await app.listen(3000);
}
bootstrap();
