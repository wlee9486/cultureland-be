import {
  ReviewResponseDto,
  ReviewWithReactionsType,
} from 'src/domains/reviews/reviews.dto';

export default function countReviewReactions(
  reviews: ReviewWithReactionsType[],
): ReviewResponseDto[] {
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
