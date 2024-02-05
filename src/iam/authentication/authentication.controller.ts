import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { Auth } from './decorators/auth.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthType } from './enums/auth-type.enum';

@Auth(AuthType.None)
@ApiTags('authentication')
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @ApiCreatedResponse({ description: 'successful user registration' })
  @ApiConflictResponse({ description: 'user already exists' })
  @ApiBadRequestResponse({
    description: [
      'dto is invalid',
      'password is too short',
      'email is invalid',
    ].join(' or '),
  })
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @ApiOkResponse({ description: 'successful user login' })
  @ApiNotFoundResponse({ description: 'user not found' })
  @ApiBadRequestResponse({
    description: ['dto is invalid', 'password does not match'].join(' or '),
  })
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @ApiOkResponse({ description: 'successful token refresh' })
  @ApiUnauthorizedResponse({ description: 'refresh token is invalidated' })
  @ApiBadRequestResponse({
    description: [
      'refresh token is not a valid jwt token',
      'dto is invalid',
    ].join(' or '),
  })
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }
}
