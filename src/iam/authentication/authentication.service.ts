import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import { IRefreshTokenPayload } from 'iam/interfaces/refresh-token-payload.interface';
import { User } from 'users/entities/user.entity';
import { UsersService } from 'users/users.service';

import jwtConfig from '../config/jwt.config';
import { HashingService } from '../hashing/hashing.service';
import { IAccessTokenPayload } from '../interfaces/access-token-payload.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import {
  InvalidatedRefreshTokenError,
  TokensCacheService,
} from './tokens-cache.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly tokensCache: TokensCacheService,
  ) {}

  /**
   * Hashes the password and creates a new user entry.
   *
   * @throws if the user service throws upon entity creation.
   */
  async signUp(signUpDto: SignUpDto) {
    const user = await this.usersService.create({
      ...signUpDto,
      password: await this.hashingService.hash(signUpDto.password),
    });
    return this.generateTokens(user);
  }

  /**
   * Upon all checks successfully passing, returns two jwt tokens, the
   * access token and the refresh token.
   *
   * @throws if the user doesn't exist.
   * @throws if the password doesn't match.
   */
  async signIn(signInDto: SignInDto) {
    const user = await this.usersService.findOneByEmail(signInDto.email);

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    const isEqual = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );

    if (!isEqual) {
      throw new UnauthorizedException('Password does not match');
    }

    return this.generateTokens(user);
  }

  /**
   * Given a valid user generates a pair of access token and refresh
   * token.
   *
   * Also invalidates the previous refresh token in exchange for the
   * new one.
   */
  async generateTokens(user: User) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<IAccessTokenPayload>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        { email: user.email, role: user.role },
      ),
      this.signToken<IRefreshTokenPayload>(
        user.id,
        this.jwtConfiguration.refreshTokenTtl,
        {
          refreshTokenId,
        },
      ),
    ]);
    await this.tokensCache.insertRefreshToken(user.id, refreshTokenId);
    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Takes in a refresh token and validates it. If it's
   * valid it invalidates it and returns a new pair of access and refresh
   * tokens.
   *
   * @throws on unexpected errors or invalid tokens.
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub, refreshTokenId } =
        await this.jwtService.verifyAsync<IRefreshTokenPayload>(
          refreshTokenDto.refreshToken,
          this.jwtConfiguration,
        );

      const user = await this.usersService.findOne(sub);
      await this.tokensCache.validateRefreshToken(user.id, refreshTokenId);

      // this also invalidates the old refresh token
      return this.generateTokens(user);
    } catch (err) {
      if (err instanceof InvalidatedRefreshTokenError) {
        throw new UnauthorizedException('Access denied');
      }
      throw new UnauthorizedException();
    }
  }

  private async signToken<T>(
    userId: number,
    expiresIn: number,
    payload?: Omit<T, 'sub'>,
  ) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn: expiresIn,
      },
    );
  }
}
