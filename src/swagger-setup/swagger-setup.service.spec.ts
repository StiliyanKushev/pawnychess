import { Test, TestingModule } from '@nestjs/testing';
import swaggerConfig from './config/swagger.config';
import { SwaggerSetupService } from './swagger-setup.service';

describe('SwaggerSetupService', () => {
  let service: SwaggerSetupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwaggerSetupService,
        {
          provide: swaggerConfig.KEY,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SwaggerSetupService>(SwaggerSetupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
