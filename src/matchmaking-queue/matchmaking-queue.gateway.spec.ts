import { Test, TestingModule } from '@nestjs/testing';
import { AccessTokenGuard } from 'iam/authentication/guards/access-token/access-token.guard';
import { MatchmakingQueueGateway } from './matchmaking-queue.gateway';
import { MatchmakingQueueService } from './matchmaking-queue.service';

describe('MatchmakingQueueGateway', () => {
  let gateway: MatchmakingQueueGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchmakingQueueGateway,
        {
          provide: MatchmakingQueueService,
          useValue: {},
        },
        {
          provide: AccessTokenGuard,
          useValue: {},
        },
      ],
    }).compile();

    gateway = module.get<MatchmakingQueueGateway>(MatchmakingQueueGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
