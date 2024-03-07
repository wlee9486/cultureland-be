import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReviewRequestDto {
  @IsNotEmpty()
  eventId: number;

  @IsNumber()
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ReviewWithReactions {
  eventId: number;
  rating: number;
  content: string;
  id: number;
  reviewerId: number;
  imageUrl: string;
  reviewReactions: {
    userId: number;
    reviewId: number;
    reactionValue: number;
  }[];
}

export class ReviewResponseDto {
  id: number;
  reviewerId: number;
  eventId: number;
  imageUrl: string;
  isVerified: boolean;
  rating: number;
  content: string;
  likes: number;
  hates: number;
}
