import { GameSettingsDto } from 'gameplay/dto/game-settings.dto';
import { RoomId } from 'gameplay/gameplay.service';
import { IAccessTokenPayload } from 'iam/interfaces/access-token-payload.interface';

export class GameOverEvent {
  constructor(
    roomId: RoomId,
    gameSettings: GameSettingsDto,
    isDraw: true,
    winner?: undefined,
    loser?: undefined,
  );
  constructor(
    roomId: RoomId,
    gameSettings: GameSettingsDto,
    isDraw: false,
    winner: IAccessTokenPayload,
    loser: IAccessTokenPayload,
  );
  constructor(
    public readonly roomId: RoomId,
    public readonly gameSettings: GameSettingsDto,
    public readonly isDraw: boolean,
    public readonly winner?: IAccessTokenPayload,
    public readonly loser?: IAccessTokenPayload,
  ) {}
}
