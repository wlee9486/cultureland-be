import { ReviewResponse } from 'src/types/ReviewResponse.type';
import { ReviewWithReactionsPayload } from 'src/types/ReviewWithReactionsPayload.type';

export default function countReviewReactions(
  reviews: ReviewWithReactionsPayload[],
): ReviewResponse[] {
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
