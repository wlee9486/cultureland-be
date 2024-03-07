import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { nanoid } from 'nanoid';
import { join } from 'path';
import { PrismaService } from 'src/db/prisma/prisma.service';
import { CreateReviewRequestDto } from './reviews.dto';

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
      data: { reviewerId: userId, eventId, rating, content, imageUrl },
    });

    return review;
  }

  async createImageFile(file: Express.Multer.File) {
    const data = file.buffer;

    const basePath = join(__dirname, '/../public/images');
    const fileNameBase = nanoid();
    const extension = file.originalname.split('.').splice(-1);
    const fileName = `${fileNameBase}.${extension}`;
    const path = join(basePath, fileName);

    await writeFile(path, data);

    return fileName;
  }
}
