import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import jwtConfig from 'iam/config/jwt.config';
import { UsersService } from 'users/users.service';
import { AccessTokenGuard } from './access-token.guard';

describe('AccessTokenGuard', () => {
  let guard: AccessTokenGuard;
  let jwtService: JwtService;
  let userService: UsersService;

  // Mock JWT Payload
  const mockPayload = { sub: 'user123' };

  const mockJwtConfig: ConfigType<typeof jwtConfig> = {
    secret: undefined,
    audience: undefined,
    issuer: undefined,
    accessTokenTtl: 0,
    refreshTokenTtl: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessTokenGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn().mockReturnValue(mockPayload),
          },
        },
        {
          provide: UsersService,
          useValue: {
            hasOne: jest.fn().mockReturnValue(false),
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: mockJwtConfig,
        },
      ],
    }).compile();

    guard = module.get<AccessTokenGuard>(AccessTokenGuard);
    jwtService = module.get<JwtService>(JwtService);
    userService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate [http]', () => {
    it('should throw UnauthorizedException if token is not provided', async () => {
      const context = createMockExecutionContext('');
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValueOnce(new Error());
      const context = createMockExecutionContext('Bearer invalid_token');
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce(mockPayload);
      jest.spyOn(userService, 'hasOne').mockResolvedValueOnce(false);
      const context = createMockExecutionContext('Bearer valid_token');
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should allow access if token is valid and user exists', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce(mockPayload);
      jest.spyOn(userService, 'hasOne').mockResolvedValueOnce(true);
      const context = createMockExecutionContext('Bearer valid_token');
      await expect(guard.canActivate(context)).resolves.toBe(true);
    });
  });

  describe('canActivate [ws]', () => {
    it('should throw UnauthorizedException if token is not provided', async () => {
      const context = createMockExecutionContext('');
      jest.spyOn(context, 'getType').mockReturnValueOnce('ws');
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValueOnce(new Error());
      const context = createMockExecutionContext('Bearer invalid_token');
      jest.spyOn(context, 'getType').mockReturnValueOnce('ws');
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce(mockPayload);
      jest.spyOn(userService, 'hasOne').mockResolvedValueOnce(false);
      const context = createMockExecutionContext('Bearer valid_token');
      jest.spyOn(context, 'getType').mockReturnValueOnce('ws');
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should allow access if token is valid and user exists', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce(mockPayload);
      jest.spyOn(userService, 'hasOne').mockResolvedValueOnce(true);
      const context = createMockExecutionContext('Bearer valid_token');
      jest.spyOn(context, 'getType').mockReturnValueOnce('ws');
      await expect(guard.canActivate(context)).resolves.toBe(true);
    });
  });
});

// Utility function to create mock ExecutionContext
function createMockExecutionContext(authHeader: string): ExecutionContext {
  return {
    getType: jest.fn().mockReturnValue('http'),
    switchToWs: () => ({
      getClient: () => ({
        handshake: {
          headers: {
            authorization: authHeader,
          },
        },
      }),
    }),
    switchToHttp: () => ({
      getRequest: () => ({
        headers: {
          authorization: authHeader,
        },
      }),
    }),
  } as unknown as ExecutionContext;
}
