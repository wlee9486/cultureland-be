import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Partner, UserProfile } from '@prisma/client';
import { sign } from 'jsonwebtoken';

@Injectable()
export class AccountsService {
  constructor(private readonly configService: ConfigService) {}

  generateAccessToken(
    signedInSubject: UserProfile | Pick<Partner, 'id' | 'email'>,
    accountType: string,
  ) {
    const secretKey = this.configService.getOrThrow<string>('JWT_SECRET_KEY');
    const tokenExpirationTime = this.configService.getOrThrow<string>(
      'ACCESS_TOKEN_EXPIRATION',
    );

    if ('userId' in signedInSubject) {
      const { userId, nickname, profileImage } = signedInSubject;

      const accessToken = sign(
        { nickname, profileImage, accountType },
        secretKey,
        {
          subject: String(userId),
          expiresIn: tokenExpirationTime,
        },
      );
      return accessToken;
    } else {
      const { id, email } = signedInSubject;

      const accessToken = sign({ email, accountType }, secretKey, {
        subject: String(id),
        expiresIn: tokenExpirationTime,
      });
      return accessToken;
    }
  }
}
