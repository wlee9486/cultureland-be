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
