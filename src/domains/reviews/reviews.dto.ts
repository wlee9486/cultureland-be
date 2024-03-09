import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class CreateReviewRequestDto {
  @IsNotEmpty()
  @IsNumberString()
  eventId: string;

  @IsNumberString()
  @IsNotEmpty()
  rating: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export type ReviewWithReactionsType = Prisma.ReviewGetPayload<{
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

export class ReviewResponseDto {
  id: number;
  reviewerId: number;
  eventId: number;
  image: string;
  rating: number;
  content: string;
  likes: number;
  hates: number;
}

export class CreateReactionRequestDto {
  reactionValue: 1 | -1;
}

export type SortOrder = 'recent' | 'likes' | 'hates';
