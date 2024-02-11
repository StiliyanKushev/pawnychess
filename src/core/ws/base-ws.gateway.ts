import { Logger, UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { OnGatewayConnection } from '@nestjs/websockets';
import { AuthenticationGuard } from 'iam/authentication/guards/authentication/authentication.guard';
import { Socket } from 'socket.io';
import { GlobalValidationPipe } from 'validation/validation.module';
import { WsExceptionsFilter } from './base-exception.filter';

/**
 * This base class should be used whenever we create ws gateway
 * to ensure all global enhancers used in the http contexts also
 * work on the ws contexts.
 */
@UseGuards(AuthenticationGuard)
@UseFilters(WsExceptionsFilter)
@UsePipes(GlobalValidationPipe)
export class BaseWsGateway implements OnGatewayConnection {
  private static CONTEXT_NAME = 'WS_NETWORK' as const;

  logger: Logger = new Logger();

  handleConnection(client: Socket) {
    client.onAny((event: string, data: unknown) => {
      this.logger.log(
        `'${event}' message received: ${JSON.stringify(data)}`,
        BaseWsGateway.CONTEXT_NAME,
      );
    });
  }
}
