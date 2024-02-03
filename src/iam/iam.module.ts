import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from 'redis/redis.module';
import { UsersModule } from 'users/users.module';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { AccessTokenGuard } from './authentication/guards/access-token/access-token.guard';
import { AuthenticationGuard } from './authentication/guards/authentication/authentication.guard';
import { TokensCacheService } from './authentication/tokens-cache.service';
import { RolesGuard } from './authorization/guards/roles/roles.guard';
import jwtConfig from './config/jwt.config';
import { BcryptService } from './hashing/bcrypt.service';
import { HashingService } from './hashing/hashing.service';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    UsersModule,
    RedisModule,
  ],
  providers: [
    /**
     * Provide a valid implementation of the HashingService
     * abstract class.
     */
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    /**
     * Globally provide a guard that checks if the request comes
     * from an authenticated user.
     */
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    /**
     * Globally provide a guard that applies role restrictions to
     * marked handlers/classes accordingly.
     */
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AuthenticationService,
    AccessTokenGuard,
    TokensCacheService,
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}
