import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { AccountType } from 'src/domains/accounts/accounts.type';
import { TokenNotFoundException } from 'src/exceptions/TokenNotFound.exception';
import { TokenVerificationException } from 'src/exceptions/TokenVerification.exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const accountTypeinDecorator = this.reflector.getAllAndOverride<
      AccountType[]
    >('accountType', [context.getHandler(), context.getClass()]);

    if (!accountTypeinDecorator || accountTypeinDecorator.includes('guest')) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const accessToken = this.extractTokenFromCookie(request);
    if (!accessToken) throw new TokenNotFoundException();

    try {
      const secretKey = this.configService.getOrThrow<string>('JWT_SECRET_KEY');
      const { sub: id, accountType: accountTypeInAccessToken } = verify(
        accessToken,
        secretKey,
      ) as JwtPayload & AccountType;

      if (accountTypeInAccessToken !== accountTypeinDecorator)
        throw new Error();

      if (accountTypeinDecorator.includes('user')) {
        const user = await this.prismaService.user.findUniqueOrThrow({
          where: { id: Number(id) },
        });
        request.user = user;
      }
    } catch {
      throw new TokenVerificationException();
    }
    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    const accessToken = request.cookies['accessToken'];

    if (!accessToken) return undefined;

    return accessToken;
  }
}
