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
import jwtConfig from 'iam/config/jwt.config';
import { IAccessTokenPayload } from 'iam/interfaces/access-token-payload.interface';
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
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync<IAccessTokenPayload>(
        token,
        this.jwtConfiguration,
      );

      // verify that the user actually exists
      if (!(await this.userService.hasOne(payload.sub))) {
        throw new UnauthorizedException();
      }
      req.accessToken = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
