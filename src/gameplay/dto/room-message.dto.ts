import { IsDefined, IsString } from 'class-validator';
import { RoomId } from 'gameplay/gameplay.service';

export class RoomMsgDto {
  @IsDefined()
  @IsString()
  roomId: RoomId;
}
