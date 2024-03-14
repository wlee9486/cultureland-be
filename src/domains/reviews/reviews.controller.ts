import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { Private } from 'src/decorators/private.decorator';
import { DUser } from 'src/decorators/user.decorator';
import {
  CreateReactionRequestDto,
  CreateReviewRequestDto,
  SortOrder,
  UpdateReviewRequestDto,
} from './reviews.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Private('user')
  @UseInterceptors(FileInterceptor('image'))
  async createReview(
    @DUser() user: User,
    @Body() dto: CreateReviewRequestDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return await this.reviewsService.createReview(user, dto, image);
  }

  @Get('famous')
  async getFamousReviews() {
    return await this.reviewsService.getFamousReviews();
  }

  @Get('users/:userId')
  async getUsersReviews(@Param('userId', ParseIntPipe) userId: number) {
    return await this.reviewsService.getUsersReviews(userId);
  }

  @Get('events/:eventId')
  async getEventReviews(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('orderBy') orderBy?: SortOrder,
  ) {
    return await this.reviewsService.getEventReviews(eventId, page, orderBy);
  }

  @Get(':reviewId')
  @Private('user')
  async getReview(
    @DUser() user: User,
    @Param('reviewId', ParseIntPipe)
    reviewId: number,
  ) {
    return await this.reviewsService.getReview(user, reviewId);
  }

  @Put(':reviewId')
  @Private('user')
  @UseInterceptors(FileInterceptor('image'))
  async updateReview(
    @DUser() user: User,
    @Param('reviewId', ParseIntPipe)
    reviewId: number,
    @Body()
    dto: UpdateReviewRequestDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return await this.reviewsService.updateReview(user, reviewId, dto, image);
  }

  @Delete(':reviewId')
  @Private('user')
  async deleteReview(
    @DUser() user: User,
    @Param('reviewId', ParseIntPipe)
    reviewId: number,
  ) {
    return await this.reviewsService.deleteReview(user, reviewId);
  }

  @Post(':reviewId/reactions')
  @Private('user')
  async createReaction(
    @DUser() user: User,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() dto: CreateReactionRequestDto,
  ) {
    return await this.reviewsService.createReaction(user, reviewId, dto);
  }

  @Delete(':reviewId/reactions')
  @Private('user')
  async deleteReaction(
    @DUser() user: User,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ) {
    return await this.reviewsService.deleteReaction(user, reviewId);
  }
}
