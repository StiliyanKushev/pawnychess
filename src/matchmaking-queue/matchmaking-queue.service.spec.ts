import { Test, TestingModule } from '@nestjs/testing';
import { WsException } from '@nestjs/websockets';
import { GameplayService } from 'gameplay/gameplay.service';
import { MatchmakingQueueService } from './matchmaking-queue.service';

describe('MatchmakingQueueService', () => {
  let service: MatchmakingQueueService;
  let gameplayService: GameplayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchmakingQueueService,
        {
          provide: GameplayService,
          useValue: {
            pairPlayers: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MatchmakingQueueService>(MatchmakingQueueService);
    gameplayService = module.get<GameplayService>(GameplayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enqueuePlayer', () => {
    it('should throw an exception if the player is already queued', () => {
      const mockSocket = { accessToken: { sub: 1 } } as any;
      const searchGameDto = { timeControl: 5, timeIncrement: 3 };

      // Simulate the player being already queued
      service.enqueuePlayer(mockSocket, searchGameDto);

      expect(() => service.enqueuePlayer(mockSocket, searchGameDto)).toThrow(
        WsException,
      );
    });

    it('should enqueue a player successfully', () => {
      const mockSocket = { accessToken: { sub: 1 } } as any;
      const searchGameDto = { timeControl: 5, timeIncrement: 3 };

      service.enqueuePlayer(mockSocket, searchGameDto);

      // Verify the player is added to the queue
      expect(
        service['mmQueue']
          .get(searchGameDto.timeControl)
          ?.get(searchGameDto.timeIncrement)
          ?.has(mockSocket),
      ).toBeTruthy();
    });

    it('should pair two players when there are enough players in the queue', () => {
      const mockSocket1 = { accessToken: { sub: 1 } } as any;
      const mockSocket2 = { accessToken: { sub: 2 } } as any;
      const searchGameDto = { timeControl: 5, timeIncrement: 3 };

      service.enqueuePlayer(mockSocket1, searchGameDto);
      service.enqueuePlayer(mockSocket2, searchGameDto);

      // Verify that the gameplayService.pairPlayers method was called
      expect(gameplayService.pairPlayers).toHaveBeenCalledWith(
        mockSocket1,
        mockSocket2,
        expect.objectContaining(searchGameDto),
      );
    });

    it('should pair not two players with different search game settings', () => {
      const mockSocket1 = { accessToken: { sub: 1 } } as any;
      const mockSocket2 = { accessToken: { sub: 2 } } as any;

      service.enqueuePlayer(mockSocket1, { timeControl: 5, timeIncrement: 3 });
      service.enqueuePlayer(mockSocket2, { timeControl: 6, timeIncrement: 4 });

      expect(gameplayService.pairPlayers).not.toHaveBeenCalled();
    });
  });

  describe('dequeuePlayer', () => {
    it('should remove a player from the queue', () => {
      const mockSocket = { accessToken: { sub: 1 } } as any;
      const searchGameDto = { timeControl: 5, timeIncrement: 3 };

      service.enqueuePlayer(mockSocket, searchGameDto);
      service.dequeuePlayer(mockSocket);

      // Verify the player is removed from the queue
      expect(
        service['mmQueue']
          ?.get(searchGameDto.timeControl)
          ?.get(searchGameDto.timeIncrement)
          ?.has(mockSocket),
      ).toBeFalsy();
    });
  });
});
