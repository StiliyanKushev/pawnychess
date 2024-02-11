import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GameStateService } from './gamestate.service';

// Mock Socket and EventEmitter2
const mockSocket = () => ({
  emit: jest.fn(),
  accessToken: 'mockAccessToken',
});

const mockEventEmitter = () => ({
  emit: jest.fn(),
});

describe('GameStateService', () => {
  let gameStateService: GameStateService;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let whiteSocket: jest.Mocked<Socket>;
  let blackSocket: jest.Mocked<Socket>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GameStateService,
        { provide: EventEmitter2, useFactory: mockEventEmitter },
      ],
    }).compile();

    gameStateService = await module.resolve<GameStateService>(GameStateService);
    eventEmitter = module.get<EventEmitter2>(
      EventEmitter2,
    ) as jest.Mocked<EventEmitter2>;
    whiteSocket = mockSocket() as any;
    blackSocket = mockSocket() as any;
  });

  it('should initialize game with given parameters', () => {
    const settings = { timeControl: 600, timeIncrement: 10 }; // Example settings
    gameStateService.initialize(
      whiteSocket,
      blackSocket,
      settings,
      'x-x-x-x-x',
    );

    expect(gameStateService['settings']).toEqual(settings);
    expect(gameStateService['white']).toBe(whiteSocket);
    expect(gameStateService['black']).toBe(blackSocket);
  });

  it("should not allow playing a move if it is not the player's turn", () => {
    const settings = { timeControl: 600, timeIncrement: 10 };
    gameStateService.initialize(
      whiteSocket,
      blackSocket,
      settings,
      'x-x-x-x-x',
    );

    expect(() => gameStateService.playMove('e4', blackSocket)).toThrow(
      WsException,
    );
  });

  it('should emit game over when a player resigns', () => {
    const settings = { timeControl: 600, timeIncrement: 10 };
    gameStateService.initialize(
      whiteSocket,
      blackSocket,
      settings,
      'x-x-x-x-x',
    );

    gameStateService.resign(whiteSocket);

    expect(whiteSocket.emit).toHaveBeenCalledWith('game_over', {
      result: 'lose',
    });
    expect(blackSocket.emit).toHaveBeenCalledWith('game_over', {
      result: 'win',
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'game.over',
      expect.anything(),
    );
  });

  it('should correctly switch increment time on made move', () => {
    jest.useFakeTimers();
    const settings = { timeControl: 10, timeIncrement: 2 };
    gameStateService.initialize(
      whiteSocket,
      blackSocket,
      settings,
      'x-x-x-x-x',
    );

    gameStateService.playMove('e4', whiteSocket); // Assume valid move
    expect(gameStateService['whiteTime']).toBe(
      settings.timeControl + settings.timeIncrement,
    );
    jest.clearAllTimers();
  });
  it('should correctly switch timers and handle time updates', () => {
    jest.useFakeTimers();
    const settings = { timeControl: 10, timeIncrement: 2 }; // Short time for testing
    gameStateService.initialize(
      whiteSocket,
      blackSocket,
      settings,
      'x-x-x-x-x',
    );

    gameStateService.playMove('e4', whiteSocket); // Assume valid move
    jest.advanceTimersByTime(1000); // Advance time by 1 second

    // Assuming it's now black's turn, we check time decreased
    expect(gameStateService['blackTime']).toBe(settings.timeControl - 1);
    jest.clearAllTimers();
  });

  it('should handle game over by time run out', () => {
    jest.useFakeTimers();

    // Immediate timeout for testing
    const settings = { timeControl: 1, timeIncrement: 0 };
    gameStateService.initialize(
      whiteSocket,
      blackSocket,
      settings,
      'x-x-x-x-x',
    );

    // Advance time to trigger time out
    jest.advanceTimersByTime(2000);

    expect(whiteSocket.emit).toHaveBeenCalledWith('game_over', {
      result: 'lose',
    });
    expect(blackSocket.emit).toHaveBeenCalledWith('game_over', {
      result: 'win',
    });
    jest.clearAllTimers();
  });

  it('should send game metadata to both players on initialization', () => {
    const settings = { timeControl: 600, timeIncrement: 10 };
    gameStateService.initialize(
      whiteSocket,
      blackSocket,
      settings,
      'x-x-x-x-x',
    );

    // Verify game metadata emission
    expect(whiteSocket.emit).toHaveBeenCalledWith(
      'game_metadata',
      expect.objectContaining({
        color: 'white',
        timeControl: settings.timeControl,
        timeIncrement: settings.timeIncrement,
        roomId: 'x-x-x-x-x',
      }),
    );
    expect(blackSocket.emit).toHaveBeenCalledWith(
      'game_metadata',
      expect.objectContaining({
        color: 'black',
        timeControl: settings.timeControl,
        timeIncrement: settings.timeIncrement,
        roomId: 'x-x-x-x-x',
      }),
    );
  });

  it('should handle game draw due to stalemate correctly', () => {
    jest.useFakeTimers();
    const settings = { timeControl: 600, timeIncrement: 10 };
    gameStateService.initialize(
      whiteSocket,
      blackSocket,
      settings,
      'x-x-x-x-x',
    );

    // Trigger a drawn game by 3-fold
    gameStateService.playMove('e4', whiteSocket);
    gameStateService.playMove('e5', blackSocket);
    gameStateService.playMove('Ke2', whiteSocket);
    gameStateService.playMove('Ke7', blackSocket);
    gameStateService.playMove('Ke1', whiteSocket);
    gameStateService.playMove('Ke8', blackSocket);
    gameStateService.playMove('Ke2', whiteSocket);
    gameStateService.playMove('Ke7', blackSocket);
    gameStateService.playMove('Ke1', whiteSocket);
    gameStateService.playMove('Ke8', blackSocket);
    gameStateService.playMove('Ke2', whiteSocket);
    gameStateService.playMove('Ke7', blackSocket);

    // Verify the draw condition was handled correctly
    expect(whiteSocket.emit).toHaveBeenCalledWith('game_over', {
      result: 'draw',
    });
    expect(blackSocket.emit).toHaveBeenCalledWith('game_over', {
      result: 'draw',
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'game.over',
      expect.anything(),
    );

    jest.clearAllTimers();
  });
});
