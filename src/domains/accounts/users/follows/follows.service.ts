import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { UserNotFoundById } from 'src/exceptions/UserNotFoundById.exception';

@Injectable()
export class FollowsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserById(id: number) {
    const foundUser = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!foundUser) throw new UserNotFoundById();

    return foundUser;
  }

  async getFollowers(userId: number) {
    this.findUserById(userId);

    const followers = await this.prismaService.follow.findMany({
      where: { followingId: userId },
      select: {
        follower: {
          select: {
            id: true,
            userProfile: {
              select: { nickname: true, profileImage: true, description: true },
            },
          },
        },
      },
    });

    return followers;
  }

  async getFollowings(userId: number) {
    this.findUserById(userId);

    const followers = await this.prismaService.follow.findMany({
      where: { followerId: userId },
      select: {
        following: {
          select: {
            id: true,
            userProfile: {
              select: { nickname: true, profileImage: true, description: true },
            },
          },
        },
      },
    });

    return followers;
  }

  async addFollow(signedInUser: User, userId: number) {
    this.findUserById(userId);

    const addedFollow = await this.prismaService.follow.create({
      data: { followerId: signedInUser.id, followingId: userId },
    });

    return addedFollow;
  }

  async deleteFollow(signedInUser: User, userId: number) {
    this.findUserById(userId);

    await this.prismaService.follow.delete({
      where: {
        followerId_followingId: {
          followerId: signedInUser.id,
          followingId: userId,
        },
      },
    });

    return userId;
  }
}
