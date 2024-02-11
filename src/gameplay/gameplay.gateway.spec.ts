import { Test, TestingModule } from '@nestjs/testing';
import { GameplayGateway } from './gameplay.gateway';

describe('GameplayGateway', () => {
  let gateway: GameplayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameplayGateway],
    }).compile();

    gateway = module.get<GameplayGateway>(GameplayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
