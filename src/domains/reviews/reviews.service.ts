import {
  ObjectCannedACL,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { nanoid } from 'nanoid';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { FailedToUploadFileException } from 'src/exceptions/FailedToUploadFile.exception';
import { PermissionDeniedException } from 'src/exceptions/PermissionDenied.exception';
import { ReviewNotFoundById } from 'src/exceptions/ReviewNotFoundById.exception';
import { UploadedFileNotFoundError } from 'src/exceptions/UploadedFileNotFoundError.exception';
import {
  CreateReactionRequestDto,
  CreateReviewRequestDto,
  ReviewResponseDto,
  ReviewWithReactionsType,
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
    imageFile: Express.Multer.File,
  ) {
    const { eventId, rating, content } = dto;
    const userId = user.id;
    const image = await this.uploadImgToS3(imageFile);
    if (!image) throw new UploadedFileNotFoundError();

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

  async updateReview(
    user: User,
    reviewId: number,
    dto: CreateReviewRequestDto,
    imageFile: Express.Multer.File,
  ) {
    const { eventId, rating, content } = dto;
    const userId = user.id;
    const image = await this.uploadImgToS3(imageFile);
    if (!image) throw new UploadedFileNotFoundError();

    const foundReview = await this.findUniqueReview(reviewId);
    if (!foundReview) return new ReviewNotFoundById();
    if (userId !== foundReview.reviewerId)
      throw new PermissionDeniedException();

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
      throw new PermissionDeniedException();

    await this.prismaService.review.delete({
      where: { id: reviewId },
    });

    return reviewId;
  }

  async uploadImgToS3(file: Express.Multer.File) {
    if (!file) return undefined;

    const fileNameBase = nanoid();
    const extension = file.originalname.split('.').splice(-1);
    const fileName = `${fileNameBase}.${extension}`;

    const awsRegion = this.configService.getOrThrow('AWS_REGION');
    const bucketName = this.configService.getOrThrow('AWS_S3_BUCKET_NAME');
    const client = new S3Client({
      region: awsRegion,
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_KEY'),
      },
    });

    const key = `cultureland/review/${Date.now().toString()}-${fileName}`;
    const params: PutObjectCommandInput = {
      Key: key,
      Body: file.buffer,
      Bucket: bucketName,
      ACL: ObjectCannedACL.public_read,
    };
    const command = new PutObjectCommand(params);

    const uploadFileS3 = await client.send(command);

    if (uploadFileS3.$metadata.httpStatusCode !== 200)
      throw new FailedToUploadFileException();
    const imgUrl = `${key}`;
    return imgUrl;
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
    const listSize = Number(
      this.configService.getOrThrow('LISTSIZE_REVIEW_FAMOUS'),
    );

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
      take: listSize,
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
