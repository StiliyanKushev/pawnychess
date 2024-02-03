import { Role } from 'users/enums/role.enum';

export interface IAccessTokenPayload {
  /**
   * the subject's (user) id.
   */
  sub: number;
  /**
   * The subject's (user) email.
   */
  email: string;
  /**
   * The subject's (user) role.
   */
  role: Role;
}
