import { Test, TestingModule } from '@nestjs/testing';
import { MatchmakingQueueService } from './matchmaking-queue.service';

describe('MatchmakingQueueService', () => {
  let service: MatchmakingQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchmakingQueueService],
    }).compile();

    service = module.get<MatchmakingQueueService>(MatchmakingQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
