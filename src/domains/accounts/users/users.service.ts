import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { InvalidPasswordException } from 'src/exceptions/InvalidPassword.exception';
import { UserNotFoundByEmail } from 'src/exceptions/UserNotFoundByEmail.exception';
import { AccountsService } from '../accounts.service';
import { SignInRequestDto, SignUpRequestDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly prismaService: PrismaService,
  ) {}

  async emailCheck(email: string) {
    const existingEmail = await this.prismaService.user.count({
      where: { email },
    });

    return !!existingEmail;
  }

  async signUp(dto: SignUpRequestDto) {
    const { email, password } = dto;

    const encryptedPassword = await hash(password, 12);

    const initialNickname = email.split('@')[0];

    const user = await this.prismaService.user.create({
      data: {
        email,
        password: encryptedPassword,
        userProfile: { create: { nickname: initialNickname } },
      },
      select: { id: true, email: true },
    });

    const accessToken = this.accountsService.generateAccessToken(user, 'user');

    return accessToken;
  }

  async signIn(dto: SignInRequestDto) {
    const { email, password } = dto;

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) throw new UserNotFoundByEmail();

    const isVerified = await compare(password, user.password);
    if (!isVerified) throw new InvalidPasswordException();

    const accessToken = this.accountsService.generateAccessToken(user, 'user');

    return accessToken;
  }
}
