import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { nanoid } from 'nanoid';
import { join } from 'path';
import { PrismaService } from 'src/db/prisma/prisma.service';
import {
  CreateReactionRequestDto,
  CreateReviewRequestDto,
  ReviewResponseDto,
  ReviewWithReactionsType,
  SortOrder,
} from './reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createReview(
    user: User,
    dto: CreateReviewRequestDto,
    image: Express.Multer.File,
  ) {
    const { eventId, rating, content } = dto;
    const userId = user.id;
    const imageUrl = await this.createImageFile(image);

    const review = await this.prismaService.review.create({
      data: {
        reviewerId: userId,
        eventId: Number(eventId),
        rating: Number(rating),
        content,
        image: imageUrl,
      },
    });

    return review;
  }

  async createImageFile(file: Express.Multer.File) {
    const data = file.buffer;

    const basePath = join(__dirname, '../../../public/images');
    const fileNameBase = nanoid();
    const extension = file.originalname.split('.').splice(-1);
    const fileName = `${fileNameBase}.${extension}`;
    const path = join(basePath, fileName);

    await writeFile(path, data);

    return fileName;
  }

  async getEventReviews(eventId: string, orderBy: SortOrder) {
    const reviews = await this.prismaService.review.findMany({
      where: { eventId: Number(eventId) },
      select: {
        id: true,
        reviewerId: true,
        eventId: true,
        image: true,
        rating: true,
        content: true,
        createdAt: true,
        reviewReactions: {
          select: {
            userId: true,
            reviewId: true,
            reactionValue: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const reviewsWithReactionCounts = this.countReactions(reviews);

    if (!orderBy || orderBy === 'recent') {
      return reviewsWithReactionCounts;
    } else if (orderBy === 'likes') {
      return reviewsWithReactionCounts.sort((a, b) => b.likes - a.likes);
    } else {
      return reviewsWithReactionCounts.sort((a, b) => b.hates - a.hates);
    }
  }

  countReactions(reviews: ReviewWithReactionsType[]): ReviewResponseDto[] {
    return reviews.map((review) => ({
      ...review,
      likes: review.reviewReactions.filter(
        (reaction) => reaction.reactionValue === 1,
      ).length,
      hates: review.reviewReactions.filter(
        (reaction) => reaction.reactionValue === -1,
      ).length,
    }));
  }

  async getFamousReviews() {
    const reviews = await this.prismaService.review.findMany({
      include: {
        reviewReactions: {
          where: {
            reactionValue: 1,
          },
        },
      },
      orderBy: {
        reviewReactions: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    return reviews;
  }

  async createReaction(
    user: User,
    reviewId: number,
    dto: CreateReactionRequestDto,
  ) {
    const { reactionValue } = dto;

    const reviewReaction = await this.prismaService.reviewReaction.create({
      data: { userId: user.id, reviewId, reactionValue },
    });

    return reviewReaction;
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
