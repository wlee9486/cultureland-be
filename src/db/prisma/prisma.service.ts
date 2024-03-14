import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export const prismaExtendedClient = (prismaClient: PrismaClient) =>
  prismaClient.$extends({
    query: {
      user: {
        async delete({ args }) {
          const user = await prismaClient.user.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });

          await prismaClient.review.updateMany({
            where: { reviewerId: user.id },
            data: { deletedAt: new Date() },
          });

          await prismaClient.follow.deleteMany({
            where: { OR: [{ followerId: user.id }, { followingId: user.id }] },
          });

          return;
        },

        findUnique({ args, query }) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
      },
      review: {
        async delete({ args }) {
          const review = await prismaClient.review.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });

          await prismaClient.reviewReaction.deleteMany({
            where: { reviewId: review.id },
          });

          return;
        },
      },
    },
  });
prismaExtendedClient.bind(this);

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  readonly extendedClient = prismaExtendedClient(this);

  constructor() {
    super();
    return new Proxy(this, {
      get: (target, property) =>
        Reflect.get(
          property in this.extendedClient ? this.extendedClient : target,
          property,
        ),
    });
  }

  onModuleInit() {
    this.$connect;
  }

  onModuleDestroy() {
    this.$disconnect;
  }
}
