import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import axios from 'axios';
import { compare, hash } from 'bcrypt';
import QueryString from 'qs';
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

  async deleteUser(user: User) {
    await this.prismaService.user.delete({
      where: {
        id: user.id,
      },
    });

    return user.id;
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

  async getKakaoAccessToken(code: string) {
    const apiKey = process.env.KAKAO_REST_KEY;
    const redirectUri = process.env.KAKAO_REDIRECT_URI;
    const kakaoTokenUrl = 'https://kauth.kakao.com/oauth/token';

    const body = {
      grant_type: 'authorization_code',
      client_id: apiKey,
      redirect_uri: redirectUri,
      code,
    };
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    };

    const response = await axios.post(
      kakaoTokenUrl,
      QueryString.stringify(body),
      { headers },
    );

    if (response.status === 200) {
      return response.data.access_token;
    } else {
      throw new Error('Failed to get access token from Kakao');
    }
  }

  async getKakaoUserInfo(accessToken: string) {
    const kakaoUserInfoUrl = 'https://kapi.kakao.com/v2/user/me';
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await axios.get(kakaoUserInfoUrl, { headers });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error('Failed to get user info from Kakao');
    }
  }

  async kakaoSignIn(code: string): Promise<any> {
    const accessToken = await this.getKakaoAccessToken(code);
    const userInfo = await this.getKakaoUserInfo(accessToken);
    const { profile, email } = userInfo.kakao_account;
    const { nickname, profile_image_url } = profile;

    let user;

    user = await this.prismaService.user.findUnique({
      where: { email },
      include: { userProfile: true },
    });
    if (!user) {
      user = await this.prismaService.user.create({
        data: {
          email,
          provider: {
            connectOrCreate: {
              where: {
                provider: 'kakao',
              },
              create: {
                provider: 'kakao',
              },
            },
          },
          userProfile: {
            create: {
              nickname,
              profileImage: profile_image_url,
              description: '컬처랜드로 모여락!',
            },
          },
        },
        include: { userProfile: true },
      });
    }
    console.log(user);

    return this.accountsService.generateAccessToken(user.userProfile, 'user');
  }
}
