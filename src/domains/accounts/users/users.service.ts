import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import uploadImageToS3 from 'src/aws/uploadImageToS3';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { InvalidPasswordException } from 'src/exceptions/InvalidPassword.exception';
import { PermissionDeniedToReadReviewException } from 'src/exceptions/PermissionDeniedToReadReview.exception';
import { UserNotFoundByEmail } from 'src/exceptions/UserNotFoundByEmail.exception';
import { UserNotFoundById } from 'src/exceptions/UserNotFoundById.exception';
import countReviewReactions from 'src/utils/countReviewReactions';
import { AccountsService } from '../accounts.service';
import {
  SignInRequestDto,
  SignUpRequestDto,
  UpdateInfoRequestDto,
} from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly configService: ConfigService,
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
            description: '컬처랜드로 모여락!',
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
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        userProfile: true,
        _count: {
          select: { followers: true, followings: true },
        },
      },
    });
    if (!user) throw new UserNotFoundById();

    let isMe = false;
    if (signedInUser) {
      isMe = signedInUser.id === user.id;
    }

    return { ...user, isMe };
  }

  async updateUser(
    user: User,
    dto: UpdateInfoRequestDto,
    imageFile: Express.Multer.File,
  ) {
    const { password, nickname, description } = dto;

    const encryptedPassword = await hash(password, 12);
    const profileImage = await uploadImageToS3(imageFile, 'profile');

    const updatedUser = await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        password: encryptedPassword,
        userProfile: {
          update: {
            nickname,
            profileImage,
            description,
          },
        },
      },
      include: { userProfile: true },
    });

    const { userProfile } = updatedUser;

    return this.accountsService.generateAccessToken(userProfile, 'user');
  }

  async getAttendedEvents(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UserNotFoundById();

    const attendedEvents = await this.prismaService.userAttendedEvents.findMany(
      { where: { userId }, include: { event: true } },
    );

    return attendedEvents;
  }

  async getLikedReviews(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UserNotFoundById();
    if (user.id !== userId) throw new PermissionDeniedToReadReviewException();

    const foundReactions = await this.prismaService.reviewReaction.findMany({
      where: { AND: [{ userId }, { reactionValue: 1 }] },
      select: {
        review: {
          select: {
            id: true,
            reviewerId: true,
            eventId: true,
            image: true,
            rating: true,
            content: true,
            createdAt: true,
            isVerified: true,
            reviewReactions: {
              select: {
                userId: true,
                reviewId: true,
                reactionValue: true,
              },
            },
          },
        },
      },
    });

    const likedReviews = foundReactions.map((review) => review.review);

    const likedReviewsWithsReactionCounts = countReviewReactions(likedReviews);

    return likedReviewsWithsReactionCounts;
  }

  async deleteReaction(user: User, reviewId: number) {
    await this.prismaService.reviewReaction.delete({
      where: {
        userId_reviewId: {
          userId: user.id,
          reviewId: reviewId,
        },
      },
    });

    return reviewId;
  }
}
