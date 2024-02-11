import { IsDefined, IsString } from 'class-validator';
import { RoomMsgDto } from './room-message.dto';

export class MakeMoveDto extends RoomMsgDto {
  @IsDefined()
  @IsString()
  move: string;
}
