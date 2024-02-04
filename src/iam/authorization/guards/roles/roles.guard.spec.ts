import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Role } from 'users/enums/role.enum';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if no roles are required', () => {
    const context = {
      getHandler: () => {},
      getClass: () => {},
    } as ExecutionContext;
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(context)).toBeTruthy();
  });

  it('should deny access if roles are required but the user does not have any role', () => {
    const context = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({ accessToken: {} }),
      }),
    } as ExecutionContext;
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);

    expect(guard.canActivate(context)).toBeFalsy();
  });

  it('should allow access if roles are required and the user has a matching role', () => {
    const context = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({ accessToken: { role: Role.Admin } }),
      }),
    } as ExecutionContext;
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Role.Admin, Role.Regular]);

    expect(guard.canActivate(context)).toBeTruthy();
  });

  it('should deny access if roles are required and the user does not have a matching role', () => {
    const context = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({ accessToken: { role: Role.Regular } }),
      }),
    } as ExecutionContext;
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);

    expect(guard.canActivate(context)).toBeFalsy();
  });
});
