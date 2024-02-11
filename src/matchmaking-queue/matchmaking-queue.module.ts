import { Module } from '@nestjs/common';
import { GameplayModule } from 'gameplay/gameplay.module';
import { IamModule } from 'iam/iam.module';
import { MatchmakingQueueGateway } from './matchmaking-queue.gateway';
import { MatchmakingQueueService } from './matchmaking-queue.service';

@Module({
  imports: [IamModule, GameplayModule],
  providers: [MatchmakingQueueGateway, MatchmakingQueueService],
})
export class MatchmakingQueueModule {}
