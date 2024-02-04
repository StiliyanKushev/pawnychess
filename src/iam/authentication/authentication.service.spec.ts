import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import jwtConfig from 'iam/config/jwt.config';
import { HashingService } from 'iam/hashing/hashing.service';
import { IRefreshTokenPayload } from 'iam/interfaces/refresh-token-payload.interface';
import { User } from 'users/entities/user.entity';
import { Role } from 'users/enums/role.enum';
import { UsersService } from 'users/users.service';
import { AuthenticationService } from './authentication.service';
import { TokensCacheService } from './tokens-cache.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let usersService: UsersService;
  let hashingService: HashingService;
  let jwtService: JwtService;
  let tokensCacheService: TokensCacheService;

  const mockUser: User = {
    id: 0,
    email: 'email',
    password: 'password',
    role: Role.Regular,
  };

  const mockRefreshTokenPayload: IRefreshTokenPayload = {
    sub: 0,
    refreshTokenId: 'x-x-x-x-x',
  };

  const mockHash = 'mock_hash';
  const mockSignString = 'token_string';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockUser),
            findOneByEmail: jest.fn().mockResolvedValue(mockUser),
            findOne: jest.fn().mockResolvedValue(mockUser),
          } as Partial<UsersService>,
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn().mockResolvedValue(mockHash),
            compare: jest.fn().mockResolvedValue(true),
          } as Partial<HashingService>,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue(mockSignString),
            verifyAsync: jest.fn(),
          } as Partial<JwtService>,
        },
        {
          provide: jwtConfig.KEY,
          useValue: {},
        },
        {
          provide: TokensCacheService,
          useValue: {
            insertRefreshToken: jest.fn().mockResolvedValue(true),
            validateRefreshToken: jest.fn().mockResolvedValue(true),
          } as Partial<TokensCacheService>,
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    usersService = module.get<UsersService>(UsersService);
    hashingService = module.get<HashingService>(HashingService);
    jwtService = module.get<JwtService>(JwtService);
    tokensCacheService = module.get<TokensCacheService>(TokensCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should hash the password', async () => {
      jest.spyOn(usersService, 'create').mockResolvedValueOnce(mockUser);
      await service.signUp({ email: 'email', password: 'abc' });
      expect(jest.spyOn(hashingService, 'hash')).toHaveBeenCalled();
    });
    it('should create the user', async () => {
      const signUpDto = { email: 'email', password: 'abc' };
      jest.spyOn(usersService, 'create').mockResolvedValueOnce(mockUser);
      await service.signUp(signUpDto);
      expect(jest.spyOn(usersService, 'create')).toHaveBeenCalledWith({
        ...signUpDto,
        password: mockHash,
      });
    });
    it('should throw on user conflict', async () => {
      jest.spyOn(usersService, 'create').mockResolvedValueOnce(mockUser);
      jest.spyOn(usersService, 'create').mockRejectedValueOnce(new Error());
      const signUpDto = { email: 'email', password: 'abc' };
      await service.signUp(signUpDto);
      expect(service.signUp(signUpDto)).rejects.toThrow();
    });
    it('should return both tokens', async () => {
      const signUpDto = { email: 'email', password: 'abc' };
      const result = await service.signUp(signUpDto);
      expect(result).toMatchObject({
        accessToken: mockSignString,
        refreshToken: mockSignString,
      });
    });
  });

  describe('signIn', () => {
    it('should throw if user not found', async () => {
      const signInDto = { email: 'email', password: 'abc' };
      jest
        .spyOn(usersService, 'findOneByEmail')
        .mockRejectedValueOnce(new Error());
      expect(service.signIn(signInDto)).rejects.toThrow();
    });
    it('should throw if passwords mismatch', async () => {
      const signInDto = { email: 'email', password: 'abc' };
      jest.spyOn(hashingService, 'compare').mockResolvedValueOnce(false);
      expect(service.signIn(signInDto)).rejects.toThrow();
    });
    it('should return both tokens', async () => {
      const signInDto = { email: 'email', password: 'abc' };
      const result = await service.signIn(signInDto);
      expect(result).toMatchObject({
        accessToken: mockSignString,
        refreshToken: mockSignString,
      });
    });
  });

  describe('generateTokens', () => {
    it('should sign both tokens', async () => {
      await service.generateTokens(mockUser);
      expect(jest.spyOn(jwtService, 'signAsync')).toHaveBeenCalledTimes(2);
    });
    it('should cache the refresh token', async () => {
      await service.generateTokens(mockUser);
      expect(
        jest.spyOn(tokensCacheService, 'insertRefreshToken'),
      ).toHaveBeenCalled();
    });
    it('should return both tokens', async () => {
      const result = await service.generateTokens(mockUser);
      expect(result).toMatchObject({
        accessToken: mockSignString,
        refreshToken: mockSignString,
      });
    });
  });

  describe('refreshToken', () => {
    it('should throw on altered jwt token', async () => {
      const refreshTokenDto = { refreshToken: 'test' };
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValueOnce(new Error());
      expect(service.refreshToken(refreshTokenDto)).rejects.toThrow();
    });
    it('should throw on invalid refresh token', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValueOnce(mockRefreshTokenPayload);
      const refreshTokenDto = { refreshToken: 'test' };
      jest
        .spyOn(tokensCacheService, 'validateRefreshToken')
        .mockRejectedValueOnce(new Error());
      expect(service.refreshToken(refreshTokenDto)).rejects.toThrow();
    });
    it('should return both tokens', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValueOnce(mockRefreshTokenPayload);
      const refreshTokenDto = { refreshToken: 'test' };
      const result = await service.refreshToken(refreshTokenDto);
      expect(result).toMatchObject({
        accessToken: mockSignString,
        refreshToken: mockSignString,
      });
    });
  });
});
