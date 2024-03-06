import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { sign } from 'jsonwebtoken';

@Injectable()
export class AccountsService {
  constructor(private readonly configService: ConfigService) {}

  generateAccessToken(user: Pick<User, 'id' | 'email'>) {
    const { id, email } = user;
    const secretKey = this.configService.getOrThrow<string>('JWT_SECRET_KEY');
    const tokenExpirationTime = this.configService.getOrThrow<string>(
      'ACCESS_TOKEN_EXPIRATION',
    );

    const accessToken = sign({ email, accountType: 'user' }, secretKey, {
      subject: String(id),
      expiresIn: tokenExpirationTime,
    });

    return accessToken;
  }
}
