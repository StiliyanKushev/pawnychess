import { Test, TestingModule } from '@nestjs/testing';
import { MatchmakingQueueGateway } from './matchmaking-queue.gateway';

describe('MatchmakingQueueGateway', () => {
  let gateway: MatchmakingQueueGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchmakingQueueGateway],
    }).compile();

    gateway = module.get<MatchmakingQueueGateway>(MatchmakingQueueGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
