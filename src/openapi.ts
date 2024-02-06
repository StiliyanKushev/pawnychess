import { NestFactory } from '@nestjs/core';
import fs from 'fs';
import { SwaggerSetupService } from 'swagger-setup/swagger-setup.service';
import converter from 'widdershins';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const document = app.get(SwaggerSetupService).setup(app);
  const docs = await converter.convert(document, {
    code: true,
    omitBody: true,
    omitHeader: true,
  });
  fs.writeFileSync('./API_DOCUMENTATION.md', docs);
  process.exit();
}
bootstrap();
