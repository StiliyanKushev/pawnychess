import { INestApplication, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import swaggerConfig from './config/swagger.config';

@Injectable()
export class SwaggerSetupService {
  constructor(
    @Inject(swaggerConfig.KEY)
    private readonly swaggerConfiguration: ConfigType<typeof swaggerConfig>,
  ) {}

  /**
   * Setup function expected to be called in the
   * bootstrapping phase that will setup additional
   * configuration to enable swagger.
   */
  /* istanbul ignore next */
  setup(app: INestApplication): OpenAPIObject {
    const options = new DocumentBuilder()
      .setTitle(this.swaggerConfiguration.title)
      .setDescription(this.swaggerConfiguration.description)
      .setVersion(this.swaggerConfiguration.version)
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
    return document;
  }
}
