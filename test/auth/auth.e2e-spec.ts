import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from 'database/database.module';
import { RefreshTokenDto } from 'iam/authentication/dto/refresh-token.dto';
import { SignInDto } from 'iam/authentication/dto/sign-in.dto';
import { SignUpDto } from 'iam/authentication/dto/sign-up.dto';
import { IamModule } from 'iam/iam.module';
import path from 'path';
import { RedisModule } from 'redis/redis.module';
import request from 'supertest';
import { ValidationModule } from 'validation/validation.module';

describe('[Feature] IAM - /authentication', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: path.join(__dirname, '../../.env.e2e'),
        }),
        DatabaseModule.forRoot(),
        RedisModule.forRoot(),
        ValidationModule.forRoot(),
        IamModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  /**
   * Helper function to make sure a string is a valid
   * jwt token.
   */
  function verifyTokenIntegrity(token: string) {
    // Split the token by '.'
    const parts = token.split('.');

    // Check if token has three parts
    expect(parts).toHaveLength(3);

    // Function to validate Base64-URL strings
    const isBase64Url = (str) => {
      const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
      return base64UrlRegex.test(str);
    };

    // Validate each part of the token
    parts.forEach((part) => {
      expect(isBase64Url(part)).toBeTruthy();
    });

    // Optionally, decode and validate the payload and header
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

    // Validate the structure of the header and payload
    expect(header).toBeInstanceOf(Object);
    expect(payload).toBeInstanceOf(Object);
  }

  describe('Sign up [POST /sign-up]', () => {
    it('should work for a new user', () => {
      return request(app.getHttpServer())
        .post('/authentication/sign-up')
        .send({
          email: 'user1@email.com',
          password: '0123456789',
        } as SignUpDto)
        .expect(HttpStatus.CREATED)
        .then(({ body: { accessToken, refreshToken } }) => {
          verifyTokenIntegrity(accessToken);
          verifyTokenIntegrity(refreshToken);
        });
    });
    it('should throw if user already exists', () => {
      return request(app.getHttpServer())
        .post('/authentication/sign-up')
        .send({
          email: 'user1@email.com',
          password: '0000000000',
        } as SignUpDto)
        .expect(HttpStatus.CONFLICT);
    });
    it('should throw if email is invalid', () => {
      return request(app.getHttpServer())
        .post('/authentication/sign-up')
        .send({
          email: 'not_an_email',
          password: '0123456789',
        } as SignUpDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should throw if password is less than 10 chars long', () => {
      return request(app.getHttpServer())
        .post('/authentication/sign-up')
        .send({
          email: 'user2@email.com',
          password: '123',
        } as SignUpDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('should throw if dto is invalid', () => {
      return request(app.getHttpServer())
        .post('/authentication/sign-up')
        .send({} as SignUpDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
  describe('Sign in [POST /sign-in]', () => {
    it('should work for an existing user', () => {
      return request(app.getHttpServer())
        .post('/authentication/sign-in')
        .send({
          email: 'user1@email.com',
          password: '0123456789',
        } as SignInDto)
        .expect(HttpStatus.OK);
    });
    it('should throw if user not found', () => {
      return request(app.getHttpServer())
        .post('/authentication/sign-in')
        .send({
          email: 'user3@email.com',
          password: '0123456789',
        } as SignInDto)
        .expect(HttpStatus.NOT_FOUND);
    });
    it('should throw if password does not match', () => {
      return request(app.getHttpServer())
        .post('/authentication/sign-in')
        .send({
          email: 'user1@email.com',
          password: '1111111111',
        } as SignInDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should throw if dto is invalid', () => {
      return request(app.getHttpServer())
        .post('/authentication/sign-in')
        .send({} as SignInDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
  describe('Refresh token [POST /refresh-token]', () => {
    it('should work if refresh token is valid', async () => {
      const refreshToken = await request(app.getHttpServer())
        .post('/authentication/sign-in')
        .send({
          email: 'user1@email.com',
          password: '0123456789',
        } as SignInDto)
        .then<string>(({ body: { refreshToken } }) => refreshToken);

      return request(app.getHttpServer())
        .post('/authentication/refresh-token')
        .send({ refreshToken } as RefreshTokenDto)
        .expect(HttpStatus.OK);
    });
    it('should throw if refresh token is invalid', () => {
      return request(app.getHttpServer())
        .post('/authentication/refresh-token')
        .send({ refreshToken: 'not_real_token' } as RefreshTokenDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should throw if refresh token is invalidated', async () => {
      const refreshToken = await request(app.getHttpServer())
        .post('/authentication/sign-in')
        .send({
          email: 'user1@email.com',
          password: '0123456789',
        } as SignInDto)
        .then<string>(({ body: { refreshToken } }) => refreshToken);

      // logging in again will invalidate the previous refresh token
      await request(app.getHttpServer())
        .post('/authentication/sign-in')
        .send({
          email: 'user1@email.com',
          password: '0123456789',
        } as SignInDto);

      return request(app.getHttpServer())
        .post('/authentication/refresh-token')
        .send({ refreshToken } as RefreshTokenDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should throw if dto is invalid', () => {
      return request(app.getHttpServer())
        .post('/authentication/refresh-token')
        .send({} as RefreshTokenDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  afterAll(async () => {
    await app?.close();
  });
});
