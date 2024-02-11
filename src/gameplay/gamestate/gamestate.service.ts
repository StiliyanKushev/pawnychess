import { Injectable, Scope } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WsException } from '@nestjs/websockets';
import { Chess } from 'chess.js';
import { GameSettingsDto } from 'gameplay/dto/game-settings.dto';
import { GameOverEvent } from 'gameplay/events/game-over.event';
import { RoomId } from 'gameplay/gameplay.service';
import { Socket } from 'socket.io';

@Injectable({ scope: Scope.TRANSIENT })
export class GameStateService {
  private currentPlayerTurn: 'white' | 'black' = 'white';
  private game: Chess;
  private whiteTime: number;
  private blackTime: number;
  private whiteTimer?: NodeJS.Timeout;
  private blackTimer?: NodeJS.Timeout;

  private white: Socket;
  private black: Socket;
  private settings: GameSettingsDto;
  private roomId: RoomId;

  constructor(private eventEmitter: EventEmitter2) {}

  initialize(
    white: Socket,
    black: Socket,
    settings: GameSettingsDto,
    roomId: RoomId,
  ) {
    this.white = white;
    this.black = black;
    this.settings = settings;
    this.roomId = roomId;

    this.game = new Chess();
    this.whiteTime = this.settings.timeControl;
    this.blackTime = this.settings.timeControl;
    this.sendGameMetadata();
    this.beginGameClock();
  }

  sendGameMetadata() {
    this.white.emit('game_metadata', {
      color: 'white',
      opponent: this.black.accessToken,
      timeControl: this.settings.timeControl,
      timeIncrement: this.settings.timeIncrement,
      roomId: this.roomId,
    });

    this.black.emit('game_metadata', {
      color: 'black',
      opponent: this.white.accessToken,
      timeControl: this.settings.timeControl,
      timeIncrement: this.settings.timeIncrement,
      roomId: this.roomId,
    });
  }
  private beginGameClock() {
    this.startTimer(this.currentPlayerTurn);
  }

  private switchTimer() {
    if (this.currentPlayerTurn === 'white') {
      this.stopTimer('black');
      this.startTimer('white');
    } else {
      this.stopTimer('white');
      this.startTimer('black');
    }
  }

  private startTimer(player: 'white' | 'black') {
    const updateInterval = 1000; // Update every second
    const timer = setInterval(() => {
      if (player === 'white') {
        if (this.whiteTime > 0) {
          this.whiteTime -= 1;
        } else {
          this.onTimeRunOut(this.black, this.white);
        }
      } else {
        if (this.blackTime > 0) {
          this.blackTime -= 1;
        } else {
          this.onTimeRunOut(this.white, this.black);
        }
      }
      // Emit time update to clients
      this.white.emit('time_update', {
        whiteTime: this.whiteTime,
        blackTime: this.blackTime,
      });
      this.black.emit('time_update', {
        whiteTime: this.whiteTime,
        blackTime: this.blackTime,
      });
    }, updateInterval);

    if (player === 'white') {
      this.whiteTimer = timer;
    } else {
      this.blackTimer = timer;
    }
  }

  private stopTimer(player: 'white' | 'black') {
    if (player === 'white' && this.whiteTimer) {
      clearInterval(this.whiteTimer);
    } else if (player === 'black' && this.blackTimer) {
      clearInterval(this.blackTimer);
    }
  }

  private onTimeRunOut(winner: Socket, loser: Socket) {
    this.stopTimer('white');
    this.stopTimer('black');
    this.onGameFinish(winner, loser);
  }

  playMove(move: string, client: Socket) {
    if (
      (client === this.white && this.currentPlayerTurn !== 'white') ||
      (client === this.black && this.currentPlayerTurn !== 'black')
    ) {
      throw new WsException('Not your turn');
    }

    try {
      this.game.move(move);
    } catch (e) {
      throw new WsException(e.message);
    }

    // Notify both clients of the move
    const opponent = client === this.white ? this.black : this.white;
    client.emit('board_update', { fen: this.game.fen(), yourTurn: false });
    opponent.emit('board_update', { fen: this.game.fen(), yourTurn: true });

    // Check game status
    if (this.game.isCheckmate()) {
      this.onGameFinish(client, opponent);
    } else if (
      this.game.isDraw() ||
      this.game.isStalemate() ||
      this.game.isThreefoldRepetition() ||
      this.game.isInsufficientMaterial()
    ) {
      this.onGameDraw();
    } else {
      // Switch turns
      this.currentPlayerTurn =
        this.currentPlayerTurn === 'white' ? 'black' : 'white';
    }

    if (client === this.white) {
      this.whiteTime += this.settings.timeIncrement;
    } else {
      this.blackTime += this.settings.timeIncrement;
    }
    this.switchTimer();
  }

  resign(client: Socket) {
    const winner = client === this.white ? this.black : this.white;
    this.onGameFinish(winner, client);
  }

  private onGameFinish(winner: Socket, loser: Socket) {
    winner.emit('game_over', { result: 'win' });
    loser.emit('game_over', { result: 'lose' });
    this.eventEmitter.emit(
      'game.over',
      new GameOverEvent(
        this.roomId,
        this.settings,
        false,
        winner.accessToken!,
        loser.accessToken!,
      ),
    );
  }

  private onGameDraw() {
    this.white.emit('game_over', { result: 'draw' });
    this.black.emit('game_over', { result: 'draw' });
    this.eventEmitter.emit(
      'game.over',
      new GameOverEvent(this.roomId, this.settings, true),
    );
  }
}
