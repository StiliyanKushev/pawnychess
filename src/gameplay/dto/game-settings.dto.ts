import { IsDefined, IsNumber } from 'class-validator';

export class GameSettingsDto {
  @IsDefined()
  @IsNumber()
  timeControl: number;

  @IsDefined()
  @IsNumber()
  timeIncrement: number;
}
