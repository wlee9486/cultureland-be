import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { Request } from 'express';
import { Private } from 'src/decorators/private.decorator';
import {
  CreateReactionRequestDto,
  CreateReviewRequestDto,
  SortOrder,
} from './reviews.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Private('user')
  @UseInterceptors(FileInterceptor('image'))
  async createReview(
    @Req() req: Request,
    @Body() dto: CreateReviewRequestDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const user: User = req.user;

    return await this.reviewsService.createReview(user, dto, image);
  }

  @Get()
  async getEventReviews(
    @Query('eventId') eventId: string,
    @Query('orderBy') orderBy?: SortOrder,
  ) {
    return await this.reviewsService.getEventReviews(eventId, orderBy);
  }

  @Post(':reviewId/reactions')
  @Private('user')
  async createReaction(
    @Req() req: Request,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() dto: CreateReactionRequestDto,
  ) {
    const user: User = req.user;

    return await this.reviewsService.createReaction(user, reviewId, dto);
  }
}
