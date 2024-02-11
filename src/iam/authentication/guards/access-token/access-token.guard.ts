import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';
import jwtConfig from 'iam/config/jwt.config';
import { IAccessTokenPayload } from 'iam/interfaces/access-token-payload.interface';
import { Socket } from 'socket.io';
import { UsersService } from 'users/users.service';

/**
 * Make sure to be type friendly and append the user as an
 * optional property to the request.
 */
declare module 'express-serve-static-core' {
  export interface Request {
    accessToken?: IAccessTokenPayload;
  }
}

/**
 * Make sure to be type friendly and append the user as an
 * optional property to the ws socket.
 */
declare module 'socket.io' {
  export interface Socket {
    accessToken?: IAccessTokenPayload;
  }
}

/**
 * This guard handles the main logic of extracting the jwt token
 * from the request headers and verifying it's validity.
 *
 * If everything's successful, the accessToken is attached to
 * the request object.
 *
 * @throws UnauthorizedException should anything go wrong.
 *
 * @note
 * This guard is not meant to be used directly.
 */

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() == 'ws') {
      return this.handleWsContext(context);
    } else if (context.getType() == 'http') {
      return this.handleHttpContext(context);
    } else {
      return true;
    }
  }

  async canActivateWsClientConnection(client: Socket): Promise<boolean> {
    const token = this.extractTokenFromHeader(client.handshake.headers);
    client.accessToken = await this.verifyTokenOrFail(token);
    return true;
  }

  private async handleHttpContext(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const token = this.extractTokenFromHeader(req.headers);
    req.accessToken = await this.verifyTokenOrFail(token);
    return true;
  }

  private async handleWsContext(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToWs();
    const client = ctx.getClient<Socket>();
    return await this.canActivateWsClientConnection(client);
  }

  private async verifyTokenOrFail(token: string): Promise<IAccessTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<IAccessTokenPayload>(
        token,
        this.jwtConfiguration,
      );

      // verify that the user actually exists
      if (!(await this.userService.hasOne(payload.sub))) {
        throw new UnauthorizedException();
      }
      return payload;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(headers: IncomingHttpHeaders): string {
    const [, token] = headers.authorization?.split(' ') ?? [];
    if (!token) {
      throw new UnauthorizedException();
    }
    return token;
  }
}
