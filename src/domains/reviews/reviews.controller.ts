import { Body, Controller, Post, Req, UploadedFile } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { Private } from 'src/decorators/private.decorator';
import { CreateReviewRequestDto } from './reviews.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @Private('user')
  async createReview(
    @Req() req: Request,
    @Body() dto: CreateReviewRequestDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const user: User = req.user;

    return await this.reviewsService.createReview(user, dto, image);
  }
}
