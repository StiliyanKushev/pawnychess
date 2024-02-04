import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthType } from 'iam/authentication/enums/auth-type.enum';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthenticationGuard } from './authentication.guard';

describe('AuthenticationGuard', () => {
  let guard: AuthenticationGuard;

  const mockContext = {
    getHandler: () => {},
    getClass: () => {},
  } as ExecutionContext;

  const mockReflector: Partial<Reflector> = {
    getAllAndOverride: jest.fn(),
  };

  const mockAccessTokenGuard: Partial<AccessTokenGuard> = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: AccessTokenGuard,
          useValue: mockAccessTokenGuard,
        },
      ],
    }).compile();

    guard = module.get<AuthenticationGuard>(AuthenticationGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should activate when AuthType.None', async () => {
      jest
        .spyOn(mockReflector, 'getAllAndOverride')
        .mockReturnValue([AuthType.None]);
      expect(guard.canActivate(mockContext)).resolves.toBeTruthy();
    });

    it('should use "AccessTokenGuard" when AuthType.Bearer', async () => {
      jest
        .spyOn(mockReflector, 'getAllAndOverride')
        .mockReturnValue([AuthType.None, AuthType.Bearer]);
      await guard.canActivate(mockContext);
      expect(
        jest.spyOn(mockAccessTokenGuard, 'canActivate'),
      ).toHaveBeenCalledWith(mockContext);
    });

    it('should use "AccessTokenGuard" when no auth type set', async () => {
      jest.spyOn(mockReflector, 'getAllAndOverride').mockReturnValue([]);
      await guard.canActivate(mockContext);
      expect(
        jest.spyOn(mockAccessTokenGuard, 'canActivate'),
      ).toHaveBeenCalledWith(mockContext);
    });
  });
});
