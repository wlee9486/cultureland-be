import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { PartnersService } from './partners.service';
import { SignUpRequestDto } from './partners.dto';

@Controller('accounts/partners')
export class PartnersController {
  constructor(
    private readonly configService: ConfigService,
    private readonly partnersService: PartnersService,
  ) {}

  maxAge = Number(
    this.configService.getOrThrow<string>('ACCESS_TOKEN_MAX_AGE'),
  );

  @Get('email-check')
  async emailCheck(@Query('email') email) {
    const isExistingEmail = await this.partnersService.emailCheck(email);

    return isExistingEmail;
  }

  @Post('sign-up')
  async signUp(
    @Body() dto: SignUpRequestDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const accessToken = await this.partnersService.signUp(dto);

    response.cookie('accessToken', accessToken, {
      domain: process.env.FRONT_SERVER,
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      maxAge: this.maxAge,
    });

    return accessToken;
  }
}
