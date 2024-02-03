import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthType } from '../../enums/auth-type.enum';
import { Reflector } from '@nestjs/core';
import { AUTH_TYPE_KEY } from '../../decorators/auth.decorator';

/**
 * This guard serves the purpose of preventing unauthorized users
 * from accessing certain handlers and/or whole classes should they
 * be protected with the appropriate decorators.
 *
 * By default, everything is guarded by this and the default strategy
 * is Authorization header "Bearer" checking.
 * @see AuthType for other types of checks.
 *
 * To make a handler/class public you have to specifically assign an
 * authentication type "None" to it.
 * @see Auth decorator.
 */

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;
  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  > = {
    [AuthType.Bearer]: this.accessTokenGuard,
    [AuthType.None]: { canActivate: () => true },
  };

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes: AuthType[] = this.reflector.getAllAndOverride(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];
    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();

    for (const guard of guards) {
      if (!(await guard.canActivate(context))) {
        throw new UnauthorizedException();
      }
    }

    return true;
  }
}
