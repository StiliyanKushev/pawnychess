import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../../decorators/roles.decorator';
import { Role } from 'users/enums/role.enum';
import { Request } from 'express';

/**
 * This guard is simply responsible narrowing access down
 * with regards to any given specific user roles for handlers and/or classes.
 *
 * By default if the handler/class is not restricted to any given roles,
 * this guard activates successfully.
 *
 * This is to be used with the `Roles` decorator.
 * @see Roles decorator.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const contextRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!contextRoles) {
      return true;
    }

    const payload = context.switchToHttp().getRequest<Request>().accessToken;
    return contextRoles.some((role) => payload?.role == role);
  }
}
