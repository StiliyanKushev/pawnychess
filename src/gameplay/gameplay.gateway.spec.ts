import { Test } from '@nestjs/testing';
import { AccessTokenGuard } from 'iam/authentication/guards/access-token/access-token.guard';
import { Socket } from 'socket.io';
import { MakeMoveDto } from './dto/make-move.dto';
import { ResignDto } from './dto/resign.dto';
import { GameplayGateway } from './gameplay.gateway';
import { GameplayService } from './gameplay.service';

describe('GameplayGateway', () => {
  let gateway: GameplayGateway;
  let gameplayService: GameplayService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GameplayGateway,
        {
          provide: GameplayService,
          useValue: {
            playMove: jest.fn(),
            resign: jest.fn(),
          },
        },
        {
          provide: AccessTokenGuard,
          useValue: {
            canActivateWsClientConnection: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    gateway = module.get<GameplayGateway>(GameplayGateway);
    gameplayService = module.get<GameplayService>(GameplayService);
  });

  it('should call gameplayService.playMove with correct parameters on "make_move" event', async () => {
    const makeMoveDto: MakeMoveDto = { roomId: 'x-x-x-x-x', move: 'e2e4' };
    const mockClient = {} as Socket;

    await gateway.handleMakeMove(makeMoveDto, mockClient);

    expect(gameplayService.playMove).toHaveBeenCalledWith(
      makeMoveDto,
      mockClient,
    );
  });

  it('should call gameplayService.resign with correct parameters on "resign" event', async () => {
    const resignDto: ResignDto = { roomId: 'x-x-x-x-x' };
    const mockClient = {} as Socket;

    await gateway.handleResign(resignDto, mockClient);

    expect(gameplayService.resign).toHaveBeenCalledWith(resignDto, mockClient);
  });
});
