import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import uploadImageToS3 from 'src/aws/uploadImageToS3';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { PermissionDeniedToEditReviewException } from 'src/exceptions/PermissionDeniedToEditReview.exception';
import { ReviewNotFoundById } from 'src/exceptions/ReviewNotFoundById.exception';
import { ReviewResponse } from 'src/types/ReviewResponse.type';
import countReviewReactions from 'src/utils/countReviewReactions';
import {
  CreateReactionRequestDto,
  CreateReviewRequestDto,
  SortOrder,
} from './reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async createReview(
    user: User,
    dto: CreateReviewRequestDto,
    imageFile?: Express.Multer.File,
  ) {
    const { eventId, rating, content } = dto;
    const userId = user.id;

    let image;
    if (imageFile) {
      image = await uploadImageToS3(imageFile, 'review');
    } else {
      image = null;
    }

    const userEvent = await this.prismaService.userAttendedEvents.findUnique({
      where: { userId_eventId: { userId, eventId: Number(eventId) } },
    });

    let isVerified: boolean;
    if (userEvent) isVerified = true;

    const review = await this.prismaService.review.create({
      data: {
        reviewerId: userId,
        eventId: Number(eventId),
        rating: Number(rating),
        content,
        image,
        isVerified,
      },
    });

    return review;
  }

  async getReview(user: User, reviewId: number) {
    const review = await this.prismaService.review.findUnique({
      where: { id: reviewId },
    });
    if (review.reviewerId !== user.id) {
      throw new PermissionDeniedException();
    }

    return review;
  }

  async updateReview(
    user: User,
    reviewId: number,
    dto: CreateReviewRequestDto,
    imageFile?: Express.Multer.File,
  ) {
    const { eventId, rating, content } = dto;
    const userId = user.id;

    let image;
    if (imageFile) {
      image = await uploadImageToS3(imageFile, 'review');
    } else {
      image = null;
    }

    const foundReview = await this.findUniqueReview(reviewId);
    if (!foundReview) return new ReviewNotFoundById();
    if (userId !== foundReview.reviewerId)
      throw new PermissionDeniedToEditReviewException();

    const updatedReview = await this.prismaService.review.update({
      where: { id: reviewId },
      data: {
        reviewerId: userId,
        eventId: Number(eventId),
        rating: Number(rating),
        content,
        image,
      },
    });

    return updatedReview;
  }

  async deleteReview(user: User, reviewId: number) {
    const userId = user.id;

    const foundReview = await this.findUniqueReview(reviewId);
    if (!foundReview) return new ReviewNotFoundById();
    if (userId !== foundReview.reviewerId)
      throw new PermissionDeniedToEditReviewException();

    await this.prismaService.review.delete({
      where: { id: reviewId },
    });

    return reviewId;
  }

  async findUniqueReview(reviewId: number) {
    const foundReview = await this.prismaService.review.findUnique({
      where: { id: reviewId },
    });

    return foundReview;
  }

  async getUsersReviews(userId: number) {
    const reviews = await this.prismaService.review.findMany({
      where: { reviewerId: userId },
    });

    return reviews;
  }

  async getEventReviews(eventId: number, page: number, orderBy: SortOrder) {
    const pageSize = Number(
      this.configService.getOrThrow('PAGESIZE_REVIEW_DETAIL'),
    );

    const reviews = await this.prismaService.review.findMany({
      where: { eventId },
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
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    const reviewsWithReactionCounts = countReviewReactions(reviews);

    return this.sortReviews(orderBy, reviewsWithReactionCounts);
  }

  sortReviews(orderBy: SortOrder, reviews: ReviewResponse[]) {
    if (!orderBy || orderBy === 'recent') {
      return reviews;
    } else if (orderBy === 'likes') {
      return reviews.sort((a, b) => b.likes - a.likes);
    } else {
      return reviews.sort((a, b) => b.hates - a.hates);
    }
  }

  async getFamousReviews() {
    const listSize = Number(
      this.configService.getOrThrow('LISTSIZE_REVIEW_FAMOUS'),
    );

    const reactions = await this.prismaService.reviewReaction.groupBy({
      by: ['reviewId'],
      where: {
        reactionValue: 1,
      },
      _count: {
        reactionValue: true,
      },
      orderBy: {
        _count: {
          reactionValue: 'desc',
        },
      },
      take: listSize,
    });

    const reviewIds = reactions.map((reaction) => reaction.reviewId);

    const reviews = await this.prismaService.review.findMany({
      where: { id: { in: reviewIds } },
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
