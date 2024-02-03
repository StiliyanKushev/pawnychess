import { randomUUID } from 'crypto';
export interface IRefreshTokenPayload {
  /**
   * the subject's (user) id.
   */
  sub: number;
  /**
   * The refresh token's id.
   */
  refreshTokenId: ReturnType<typeof randomUUID>;
}
