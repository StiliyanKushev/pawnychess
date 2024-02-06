import { NestFactory } from '@nestjs/core';
import fs from 'fs';
import { SwaggerSetupService } from 'swagger-setup/swagger-setup.service';
import converter from 'widdershins';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const document = app.get(SwaggerSetupService).setup(app);
  const docs = await converter.convert(document, {});
  fs.writeFileSync('./API_DOCUMENTATION.md', docs);
  process.exit(0);
}
bootstrap();
