import { Injectable } from '@nestjs/common';
import { RedisService } from 'redis/redis.service';

export class InvalidatedRefreshTokenError extends Error {}

/**
 * This service interacts with a redis client and caches
 * refresh tokens such that it is able to validate/invalidate
 * then.
 */
@Injectable()
export class TokensCacheService {
  constructor(private readonly redisService: RedisService) {}

  async insertRefreshToken(userId: number, tokenId: string) {
    await this.redisService.client.set(
      this.getKeyRefreshToken(userId),
      tokenId,
    );
  }
  async validateRefreshToken(userId: number, tokenId: string) {
    const storedId = await this.redisService.client.get(
      this.getKeyRefreshToken(userId),
    );
    if (storedId != tokenId) throw new InvalidatedRefreshTokenError();
  }
  async invalidateRefreshToken(userId: number) {
    await this.redisService.client.del(this.getKeyRefreshToken(userId));
  }

  private getKeyRefreshToken<T extends number>(userId: T): `user-${T}-r` {
    return `user-${userId}-r`;
  }
}
