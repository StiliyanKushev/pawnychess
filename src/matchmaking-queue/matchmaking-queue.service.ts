import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { GameplayService } from 'gameplay/gameplay.service';
import { Socket } from 'socket.io';
import { SearchGameDto } from './dto/search-game.dto';

function shiftSet(set: Set<any>) {
  const firstElement = set.values().next().value;
  if (firstElement !== undefined) {
    set.delete(firstElement);
    return firstElement;
  } else {
    return undefined;
  }
}

@Injectable()
export class MatchmakingQueueService {
  constructor(private readonly gameplayService: GameplayService) {}

  /**
   * keep track of all sockets waiting for games with respect to
   * specific time control, time increment.
   */
  private mmQueue = new Map<number, Map<number, Set<Socket>>>();

  /**
   * Store location of sockets in mmQueue in order to dequeue later.
   */
  private revQueue = new Map<Socket, [number, number]>();

  /**
   * Keep track of sockets' user identity to disallow multiple queue requests.
   */
  private identityMap = new Map<number, Socket>();

  /**
   * Handles the insertion of the client's socket in the matchmaking queue.
   */
  enqueuePlayer(client: Socket, { timeControl, timeIncrement }: SearchGameDto) {
    if (this.hasQueued(client)) {
      throw new WsException('Player is already queued');
    }

    if (!this.mmQueue.has(timeControl)) {
      this.mmQueue.set(timeControl, new Map());
    }

    if (!this.mmQueue.get(timeControl)?.has(timeIncrement)) {
      this.mmQueue.get(timeControl)!.set(timeIncrement, new Set());
    }

    this.mmQueue.get(timeControl)!.get(timeIncrement)!.add(client);
    this.revQueue.set(client, [timeControl, timeIncrement]);
    this.identityMap.set(client.accessToken!.sub, client);

    // try to pair players
    if (this.mmQueue.get(timeControl)!.get(timeIncrement)!.size >= 2) {
      const client1 = shiftSet(
        this.mmQueue.get(timeControl)!.get(timeIncrement)!,
      );
      const client2 = shiftSet(
        this.mmQueue.get(timeControl)!.get(timeIncrement)!,
      );
      this.dequeuePlayer(client1);
      this.dequeuePlayer(client2);
      this.gameplayService.pairPlayers(client1, client2, {
        timeControl,
        timeIncrement,
      });
    }
  }

  /**
   * Handles the removal of the client's socket from the matchmaking queue.
   */
  dequeuePlayer(client: Socket) {
    if (!this.revQueue.has(client)) return;
    const [timeControl, timeIncrement] = this.revQueue.get(client)!;
    this.mmQueue.get(timeControl)?.get(timeIncrement)?.delete(client);
    this.revQueue.delete(client);
    this.identityMap.delete(client.accessToken!.sub);
  }

  /**
   * Returns true if the client has already been queued, false otherwise.
   */
  private hasQueued(client: Socket) {
    return this.identityMap.has(client.accessToken!.sub);
  }
}
