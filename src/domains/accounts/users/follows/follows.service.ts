import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { UserNotFoundById } from 'src/exceptions/UserNotFoundById.exception';

@Injectable()
export class FollowsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getFollowers(userId: number) {
    const foundUser = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!foundUser) throw new UserNotFoundById();

    const followers = await this.prismaService.follow.findMany({
      where: { followingId: userId },
      select: {
        follower: {
          select: {
            id: true,
            userProfile: { select: { nickname: true, profileImage: true } },
          },
        },
      },
    });

    return followers;
  }

  
}
