import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { nanoid } from 'nanoid';
import { join } from 'path';
import { PrismaService } from 'src/db/prisma/prisma.service';
import {
  CreateReactionRequestDto,
  CreateReviewRequestDto,
  ReviewWithReactions,
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
        imageUrl,
      },
    });

    return review;
  }

  async getEventReviews(eventId: string) {
    const reviews = await this.prismaService.review.findMany({
      where: { eventId: Number(eventId) },
      select: {
        id: true,
        reviewerId: true,
        eventId: true,
        imageUrl: true,
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
    });

    const reviewsWithReactionCounts = this.countReactions(reviews);

    return reviewsWithReactionCounts;
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

  countReactions(reviews: ReviewWithReactions[]) {
    const likes = reviews.filter((review) =>
      review.reviewReactions.some((reaction) => reaction.reactionValue === 1),
    ).length;
    const hates = reviews.filter((review) =>
      review.reviewReactions.some((reaction) => reaction.reactionValue === -1),
    ).length;

    return reviews.map((review) => ({
      ...review,
      likes,
      hates,
    }));
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
}