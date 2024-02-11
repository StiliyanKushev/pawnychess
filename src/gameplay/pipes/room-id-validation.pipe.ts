import { Injectable, PipeTransform, UsePipes } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { RoomMsgDto } from 'gameplay/dto/room-message.dto';
import { GameplayService } from 'gameplay/gameplay.service';
import { GlobalValidationPipe } from 'validation/validation.module';

@Injectable()
export class RoomIdValidationPipe implements PipeTransform {
  constructor(private readonly gameplayService: GameplayService) {}

  @UsePipes(GlobalValidationPipe)
  transform(value: RoomMsgDto) {
    if (!this.gameplayService.hasRoom(value.roomId)) {
      throw new WsException('invalid room');
    }
    return value;
  }
}
