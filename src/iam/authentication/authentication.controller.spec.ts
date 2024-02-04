import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

describe('AuthenticationController /authentication', () => {
  let controller: AuthenticationController;
  let authService: AuthenticationService;

  const mockSignUpDto: SignUpDto = {
    email: 'email@email.com',
    password: '0123456789',
  };
  const mockSignInDto: SignInDto = {
    email: 'email@email.com',
    password: '0123456789',
  };
  const mockRefreshTokenDto: RefreshTokenDto = {
    refreshToken: 'x-x-x-x-x',
  };
  const mockResponse = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            signUp: jest.fn().mockResolvedValue(mockResponse),
            signIn: jest.fn().mockResolvedValue(mockResponse),
            refreshToken: jest.fn().mockResolvedValue(mockResponse),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    authService = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /sign-up', () => {
    it('should call signUp method of authentication service with correct parameters', async () => {
      await controller.signUp(mockSignUpDto);
      expect(authService.signUp).toHaveBeenCalledWith(mockSignUpDto);
    });
  });

  describe('POST /sign-in', () => {
    it('should call signIn method of authentication service with correct parameters', async () => {
      await controller.signIn(mockSignInDto);
      expect(authService.signIn).toHaveBeenCalledWith(mockSignInDto);
    });
  });

  describe('POST /refresh-token', () => {
    it('should call refreshToken method of authentication service with correct parameters', async () => {
      await controller.refreshToken(mockRefreshTokenDto);
      expect(authService.refreshToken).toHaveBeenCalledWith(
        mockRefreshTokenDto,
      );
    });
  });
});
