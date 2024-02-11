import { Injectable } from '@nestjs/common';
import { ContextId, ContextIdFactory, ModuleRef } from '@nestjs/core';
import { OnEvent } from '@nestjs/event-emitter';
import { randomUUID } from 'crypto';
import { Socket } from 'socket.io';
import { GameSettingsDto } from './dto/game-settings.dto';
import { MakeMoveDto } from './dto/make-move.dto';
import { ResignDto } from './dto/resign.dto';
import { GameOverEvent } from './events/game-over.event';
import { GameStateService } from './gamestate/gamestate.service';

export type RoomId = ReturnType<typeof randomUUID>;

@Injectable()
export class GameplayService {
  private rooms = new Map<RoomId, GameStateService>();
  private contextCache = new Map<RoomId, ContextId>();

  constructor(private readonly moduleRef: ModuleRef) {}

  hasRoom(roomId: RoomId) {
    return this.rooms.has(roomId);
  }

  async pairPlayers(
    client1: Socket,
    client2: Socket,
    gameSettingsDto: GameSettingsDto,
  ) {
    const roomId = randomUUID();

    // create new di subtree for that game
    const contextId = ContextIdFactory.create();
    const gameStateService = await this.moduleRef.resolve(
      GameStateService,
      contextId,
    );
    gameStateService.initialize(client1, client2, gameSettingsDto, roomId);
    this.rooms.set(roomId, gameStateService);
    this.contextCache.set(roomId, contextId);
  }

  playMove(makeMoveDto: MakeMoveDto, client: Socket) {
    const roomId = makeMoveDto.roomId;
    return this.rooms.get(roomId)!.playMove(makeMoveDto.move, client);
  }

  resign(resignDto: ResignDto, client: Socket) {
    const roomId = resignDto.roomId;
    return this.rooms.get(roomId)!.resign(client);
  }

  @OnEvent('game.over')
  handleGameOver(event: GameOverEvent) {
    // end room lifecycle
    this.rooms.delete(event.roomId);
    // cleanup di subtree
    this.contextCache.delete(event.roomId);
  }
}
