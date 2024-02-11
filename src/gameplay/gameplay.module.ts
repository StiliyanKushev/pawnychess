import { Module } from '@nestjs/common';
import { IamModule } from 'iam/iam.module';
import { GameplayGateway } from './gameplay.gateway';
import { GameplayService } from './gameplay.service';
import { GameStateService } from './gamestate/gamestate.service';

@Module({
  imports: [IamModule],
  providers: [GameplayService, GameplayGateway, GameStateService],
  exports: [GameplayService],
})
export class GameplayModule {}
