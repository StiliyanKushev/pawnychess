import { SetMetadata } from '@nestjs/common';
import { Role } from 'users/enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Basic decorator used to attach 'roles' that can access a particular
 * handler/class. Roles guard (registered globally) uses this metadata
 * accordingly.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
