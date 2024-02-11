import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { BaseWsGateway } from 'core/ws/base-ws.gateway';
import { AccessTokenGuard } from 'iam/authentication/guards/access-token/access-token.guard';
import { Socket } from 'socket.io';
import { SearchGameDto } from './dto/search-game.dto';
import { MatchmakingQueueService } from './matchmaking-queue.service';

@WebSocketGateway()
export class MatchmakingQueueGateway extends BaseWsGateway {
  constructor(
    private readonly mmQueueService: MatchmakingQueueService,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {
    super();
  }

  async handleConnection(client: Socket) {
    try {
      await this.accessTokenGuard.canActivateWsClientConnection(client);
      super.handleConnection(client);
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('search_game')
  handleSearchGame(
    @MessageBody() searchGameDto: SearchGameDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.mmQueueService.enqueuePlayer(client, searchGameDto);
  }

  @SubscribeMessage('search_cancel')
  handleSearchCancel(@ConnectedSocket() client: Socket) {
    this.mmQueueService.dequeuePlayer(client);
  }
}
