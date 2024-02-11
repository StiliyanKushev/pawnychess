import { Test, TestingModule } from '@nestjs/testing';
import { GameplayService } from './gameplay.service';

describe('GameplayService', () => {
  let service: GameplayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameplayService],
    }).compile();

    service = module.get<GameplayService>(GameplayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
