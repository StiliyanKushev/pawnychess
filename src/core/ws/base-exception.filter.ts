import {
  ArgumentsHost,
  Catch,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      super.catch(new WsException(exception.getResponse()), host);
      if (exception instanceof UnauthorizedException) {
        // client is not authorized, disconnect
        const ctx = host.switchToWs();
        const client = ctx.getClient<Socket>();
        client.disconnect();
      }
    } else {
      super.catch(exception, host);
    }
  }
}
