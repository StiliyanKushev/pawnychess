import { SetMetadata } from '@nestjs/common';
import { AuthType } from '../enums/auth-type.enum';

export const AUTH_TYPE_KEY = 'authType';

/**
 * Use this decorator to fine-grain the level of authentication required
 * for a particular handler and/or class.
 */
export const Auth = (...authTypes: AuthType[]) =>
  SetMetadata(AUTH_TYPE_KEY, authTypes);
