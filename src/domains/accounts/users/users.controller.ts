import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { Response } from 'express';
import { Private } from 'src/decorators/private.decorator';
import { DUser } from 'src/decorators/user.decorator';
import { SignInRequestDto, SignUpRequestDto } from './users.dto';
import { UsersService } from './users.service';

@Controller('accounts/users')
export class UsersController {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  maxAge = Number(
    this.configService.getOrThrow<string>('ACCESS_TOKEN_MAX_AGE'),
  );

  @Get('email-check')
  async emailCheck(@Query('email') email) {
    const isExistingEmail = await this.usersService.emailCheck(email);

    return isExistingEmail;
  }

  @Post('sign-up')
  async signUp(
    @Body() dto: SignUpRequestDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const accessToken = await this.usersService.signUp(dto);

    response.cookie('accessToken', accessToken, {
      domain: process.env.FRONT_SERVER,
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      maxAge: this.maxAge,
    });

    return accessToken;
  }

  @Post('sign-in')
  async signIn(
    @Body() dto: SignInRequestDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const accessToken = await this.usersService.signIn(dto);

    response.cookie('accessToken', accessToken, {
      domain: process.env.FRONT_SERVER,
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      maxAge: this.maxAge,
    });

    return accessToken;
  }

  @Post('sign-out')
  async signOut(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('accessToken', {
      domain: process.env.FRONT_SERVER,
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    });

    return 'successfully signed out';
  }
  @Post('refresh-token')
  @Private('user')
  async refreshToken(
    @DUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    const accessToken = await this.usersService.refreshToken(user);

    response.cookie('accessToken', accessToken, {
      domain: process.env.FRONT_SERVER,
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      maxAge: this.maxAge,
    });

    return accessToken;
  }

  @Get(':userId')
  @Private('guest', 'user')
  async getUser(
    @Param('userId', ParseIntPipe)
    userId: number,
    @DUser() user?: User,
  ) {
    return this.usersService.getUser(userId, user);
  }
}
