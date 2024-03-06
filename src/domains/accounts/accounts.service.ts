import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Partner, User } from '@prisma/client';
import { sign } from 'jsonwebtoken';

@Injectable()
export class AccountsService {
  constructor(private readonly configService: ConfigService) {}

  generateAccessToken(
    signedInSubject: Pick<User, 'id' | 'email'> | Pick<Partner, 'id' | 'email'>,
    accountType: string,
  ) {
    const { id, email } = signedInSubject;
    const secretKey = this.configService.getOrThrow<string>('JWT_SECRET_KEY');
    const tokenExpirationTime = this.configService.getOrThrow<string>(
      'ACCESS_TOKEN_EXPIRATION',
    );

    const accessToken = sign({ email, accountType }, secretKey, {
      subject: String(id),
      expiresIn: tokenExpirationTime,
    });

    return accessToken;
  }
}
