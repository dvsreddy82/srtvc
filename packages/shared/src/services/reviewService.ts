/**
 * Review Service
 * Handles review creation and validation
 */

import { reviewRepository } from '../repositories/reviewRepository';
import { Review } from '../models/review';

export class ReviewService {
  /**
   * Create a review for a completed booking
   */
  async createReview(
    userId: string,
    bookingId: string,
    kennelId: string,
    rating: number,
    title?: string,
    comment?: string
  ): Promise<Review> {
    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if review already exists
    const existingReview = await reviewRepository.getReviewByBookingId(bookingId);
    if (existingReview) {
      throw new Error('You have already reviewed this booking');
    }

    // Create review
    return await reviewRepository.createReview({
      userId,
      bookingId,
      kennelId,
      rating,
      title,
      comment,
    });
  }

  /**
   * Get reviews for a kennel with filters
   */
  async getKennelReviews(
    kennelId: string,
    options?: {
      rating?: number;
      limit?: number;
      lastDoc?: any;
    }
  ) {
    return await reviewRepository.getKennelReviews(kennelId, options);
  }

  /**
   * Get average rating for a kennel
   */
  async getKennelAverageRating(kennelId: string) {
    return await reviewRepository.getKennelAverageRating(kennelId);
  }

  /**
   * Get review by booking ID
   */
  async getReviewByBookingId(bookingId: string) {
    return await reviewRepository.getReviewByBookingId(bookingId);
  }
}

// Export singleton instance
export const reviewService = new ReviewService();

