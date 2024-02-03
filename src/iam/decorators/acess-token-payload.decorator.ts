import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';
import { Request } from 'express';
import { IAccessTokenPayload } from '../interfaces/access-token-payload.interface';

/**
 * Use this param decorator to quickly extract the access token payload
 * attached to that request by the authentication guard.
 */
export const AccessToken = createParamDecorator(
  (field: keyof IAccessTokenPayload | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const payload = req.accessToken;

    if (!payload) {
      throw new BadRequestException();
    }

    return field ? payload[field] : payload;
  },
);
