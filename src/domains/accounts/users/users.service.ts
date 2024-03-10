import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { InvalidPasswordException } from 'src/exceptions/InvalidPassword.exception';
import { UserNotFoundByEmail } from 'src/exceptions/UserNotFoundByEmail.exception';
import { UserNotFoundById } from 'src/exceptions/UserNotFoundById.exception';
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
        userProfile: {
          create: {
            nickname: initialNickname,
            profileImage: null,
          },
        },
      },
      include: { userProfile: true },
    });

    const { userProfile } = user;

    return this.accountsService.generateAccessToken(userProfile, 'user');
  }

  async signIn(dto: SignInRequestDto) {
    const { email, password } = dto;

    const foundUser = await this.findUserByEmail(email);

    const isVerified = await compare(password, foundUser.password);
    if (!isVerified) throw new InvalidPasswordException();

    const { userProfile } = foundUser;

    return this.accountsService.generateAccessToken(userProfile, 'user');
  }

  async refreshToken(user: User) {
    const foundUser = await this.findUserByEmail(user.email);

    const { userProfile } = foundUser;

    return this.accountsService.generateAccessToken(userProfile, 'user');
  }

  async findUserByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      include: { userProfile: true },
    });
    if (!user) throw new UserNotFoundByEmail();

    return user;
  }

  async getUser(userId: number, signedInUser?: User) {
    const foundUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!foundUser) throw new UserNotFoundById();

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        userProfile: true,
        _count: {
          select: { followers: true, following: true },
        },
      },
    });

    const isMe = signedInUser.id === user.id;

    return { ...user, isMe };
  }
}
