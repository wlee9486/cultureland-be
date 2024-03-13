import { Prisma } from '@prisma/client';

export type ReviewWithReactionsPayload = Prisma.ReviewGetPayload<{
  select: {
    id: true;
    reviewerId: true;
    eventId: true;
    image: true;
    rating: true;
    content: true;
    createdAt: true;
    reviewReactions: {
      select: {
        userId: true;
        reviewId: true;
        reactionValue: true;
      };
    };
  };
}>;
