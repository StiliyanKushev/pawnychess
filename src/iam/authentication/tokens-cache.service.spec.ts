import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from 'redis/redis.service';
import { TokensCacheService } from './tokens-cache.service';

describe('TokensCacheService', () => {
  let service: TokensCacheService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensCacheService,
        {
          provide: RedisService,
          useValue: {
            client: {
              set: jest.fn().mockResolvedValue(true),
              del: jest.fn().mockResolvedValue(true),
              get: jest.fn(),
            } as Partial<RedisService['client']>,
          },
        },
      ],
    }).compile();

    service = module.get<TokensCacheService>(TokensCacheService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('insertRefreshToken', () => {
    it('should set value in redis', async () => {
      await service.insertRefreshToken(1, 'token');
      expect(redisService.client.set).toHaveBeenCalledWith('user-1-r', 'token');
    });
  });

  describe('validateRefreshToken', () => {
    it('should throw if token mismatch', async () => {
      jest.spyOn(redisService.client, 'get').mockResolvedValue('token2');
      expect(service.validateRefreshToken(1, 'token1')).rejects.toThrow();
    });
    it('should not throw if token is valid', async () => {
      jest.spyOn(redisService.client, 'get').mockResolvedValue('token');
      expect(service.validateRefreshToken(1, 'token')).resolves.toBeUndefined();
    });
  });

  describe('invalidateRefreshToken', () => {
    it('should delete value from redis', async () => {
      service.invalidateRefreshToken(1);
      expect(redisService.client.del).toHaveBeenCalledWith('user-1-r');
    });
  });
});
