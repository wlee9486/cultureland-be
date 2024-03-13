import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { Private } from 'src/decorators/private.decorator';
import { DUser } from 'src/decorators/user.decorator';
import { AccountsService } from './../accounts.service';
import {
  SignInRequestDto,
  SignUpRequestDto,
  UpdateInfoRequestDto,
} from './users.dto';
import { UsersService } from './users.service';

@Controller('accounts/users')
export class UsersController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  maxAge = Number(
    this.configService.getOrThrow<string>('ACCESS_TOKEN_MAX_AGE'),
  );

  @Get('kakao-callback')
  async kakaoSignIn(
    @Query('code') code: string,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const accessToken = await this.usersService.kakaoSignIn(code);

    this.accountsService.setAccessTokenCookie(response, accessToken);

    response.redirect(request.headers.referer);
  }

  @Get('email-check')
  async emailCheck(@Query('email') email: string) {
    const isExistingEmail = await this.usersService.emailCheck(email);

    return isExistingEmail;
  }

  @Post('sign-up')
  async signUp(
    @Body() dto: SignUpRequestDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const accessToken = await this.usersService.signUp(dto);

    this.accountsService.setAccessTokenCookie(response, accessToken);

    return accessToken;
  }

  @Post('sign-in')
  async signIn(
    @Body() dto: SignInRequestDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const accessToken = await this.usersService.signIn(dto);

    this.accountsService.setAccessTokenCookie(response, accessToken);

    return accessToken;
  }

  @Post('sign-out')
  async signOut(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('accessToken', {
      domain: process.env.BACKEND_SERVER,
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

    this.accountsService.setAccessTokenCookie(response, accessToken);

    return accessToken;
  }

  @Get(':userId')
  @Private('user', 'guest')
  async getUser(
    @Param('userId', ParseIntPipe)
    userId: number,
    @DUser() user?: User,
  ) {
    return this.usersService.getUser(userId, user);
  }

  @Put(':userId')
  @Private('user')
  @UseInterceptors(FileInterceptor('profileImage'))
  async updateUser(
    @DUser() user: User,
    @Body() dto: UpdateInfoRequestDto,
    @UploadedFile() profileImage: Express.Multer.File,
    @Res({ passthrough: true }) response: Response,
  ) {
    const accessToken = await this.usersService.updateUser(
      user,
      dto,
      profileImage,
    );

    this.accountsService.setAccessTokenCookie(response, accessToken);

    return accessToken;
  }

  @Get(':userId/attended-events')
  async getAttendedEvents(
    @Param('userId', ParseIntPipe)
    userId: number,
  ) {
    return this.usersService.getAttendedEvents(userId);
  }
}
