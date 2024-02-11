import { IsDefined, IsNumber, IsPositive } from 'class-validator';

export class SearchGameDto {
  @IsDefined()
  @IsNumber()
  @IsPositive()
  timeControl: number;

  @IsDefined()
  @IsNumber()
  @IsPositive()
  timeIncrement: number;
}
