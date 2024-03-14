import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { InterestNotFoundException } from 'src/exceptions/InterestNotFound.exception';
import { PermissionDeniedToDeleteInterestException } from 'src/exceptions/PermissionDeniedToDeleteInterest.exception';

@Injectable()
export class InterestsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  pageSize = this.configService.getOrThrow<number>('PAGESIZE_INTEREST_LIST');

  async createInterest(user: User, eventId: number) {
    return await this.prismaService.userInterestedEvents.upsert({
      where: {
        userId_eventId: {
          eventId,
          userId: user.id,
        },
      },
      update: {},
      create: {
        eventId,
        userId: user.id,
      },
    });
  }

  async getUsersInterests(userId: number, loggedInUser: User, page: number) {
    const interests = await this.prismaService.userInterestedEvents.findMany({
      where: {
        userId,
      },
      select: { eventId: true },
      orderBy: { createdAt: 'desc' },
      skip: Number(this.pageSize) * (page - 1),
      take: Number(this.pageSize),
    });

    const isLoggedInUser = loggedInUser ? userId == loggedInUser.id : false;

    return {
      interests,
      isLoggedInUser,
    };
  }

  async deleteInterest(
    loggedInUser: User,
    dto: Prisma.UserInterestedEventsUserIdEventIdCompoundUniqueInput,
  ) {
    const { userId, eventId } = dto;
    if (
      !(await this.prismaService.userInterestedEvents.count({
        where: {
          userId,
          eventId,
        },
      }))
    )
      throw new InterestNotFoundException();
    if (userId !== loggedInUser.id)
      throw new PermissionDeniedToDeleteInterestException();
    return await this.prismaService.userInterestedEvents.delete({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });
  }
}
