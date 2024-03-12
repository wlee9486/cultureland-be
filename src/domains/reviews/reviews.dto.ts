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

export class UpdateReviewRequestDto extends CreateReviewRequestDto {}

export class CreateReactionRequestDto {
  reactionValue: 1 | -1;
}

export type SortOrder = 'recent' | 'likes' | 'hates';
