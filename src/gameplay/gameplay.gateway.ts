import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { BaseWsGateway } from 'core/ws/base-ws.gateway';
import { AccessTokenGuard } from 'iam/authentication/guards/access-token/access-token.guard';
import { Socket } from 'socket.io';
import { MakeMoveDto } from './dto/make-move.dto';
import { ResignDto } from './dto/resign.dto';
import { GameplayService } from './gameplay.service';
import { RoomIdValidationPipe } from './pipes/room-id-validation.pipe';

@WebSocketGateway()
export class GameplayGateway extends BaseWsGateway {
  constructor(
    private readonly gameplayService: GameplayService,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {
    super();
  }

  async handleConnection(client: Socket) {
    if (!(await this.accessTokenGuard.canActivateWsClientConnection(client))) {
      client.disconnect(true);
    } else {
      super.handleConnection(client);
    }
  }

  @SubscribeMessage('make_move')
  handleMakeMove(
    @MessageBody(RoomIdValidationPipe) makeMoveDto: MakeMoveDto,
    @ConnectedSocket() client: Socket,
  ) {
    return this.gameplayService.playMove(makeMoveDto, client);
  }

  @SubscribeMessage('resign')
  handleResign(
    @MessageBody(RoomIdValidationPipe) resignDto: ResignDto,
    @ConnectedSocket() client: Socket,
  ) {
    return this.gameplayService.resign(resignDto, client);
  }
}
