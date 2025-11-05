import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { Review } from '../models/review';
import { COLLECTIONS } from '../utils/constants';

export class ReviewRepository {
  private firestore = getFirestoreInstance();

  /**
   * Create a new review (immutable - cannot be edited after creation)
   */
  async createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
    try {
      // Check if review already exists for this booking
      const existingReview = await this.getReviewByBookingId(review.bookingId);
      if (existingReview) {
        throw new Error('Review already exists for this booking');
      }

      const reviewsRef = collection(this.firestore, COLLECTIONS.REVIEWS);
      const now = Date.now();
      const reviewData = {
        ...review,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(reviewsRef, reviewData);

      return {
        id: docRef.id,
        ...reviewData,
      } as Review;
    } catch (error: any) {
      throw new Error(`Failed to create review: ${error.message}`);
    }
  }

  /**
   * Get review by booking ID (one review per booking)
   */
  async getReviewByBookingId(bookingId: string): Promise<Review | null> {
    try {
      const reviewsRef = collection(this.firestore, COLLECTIONS.REVIEWS);
      const q = query(reviewsRef, where('bookingId', '==', bookingId), limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || doc.data().createdAt || Date.now(),
        updatedAt: doc.data().updatedAt?.toMillis() || doc.data().updatedAt || Date.now(),
      } as Review;
    } catch (error: any) {
      throw new Error(`Failed to get review: ${error.message}`);
    }
  }

  /**
   * Get reviews for a kennel (with pagination and rating filter)
   */
  async getKennelReviews(
    kennelId: string,
    options?: {
      rating?: number;
      limit?: number;
      lastDoc?: QueryDocumentSnapshot;
    }
  ): Promise<{ reviews: Review[]; lastDoc?: QueryDocumentSnapshot }> {
    try {
      const reviewsRef = collection(this.firestore, COLLECTIONS.REVIEWS);
      let q = query(
        reviewsRef,
        where('kennelId', '==', kennelId),
        orderBy('createdAt', 'desc')
      );

      // Add rating filter if provided
      if (options?.rating) {
        q = query(
          reviewsRef,
          where('kennelId', '==', kennelId),
          where('rating', '==', options.rating),
          orderBy('createdAt', 'desc')
        );
      }

      // Add pagination
      if (options?.lastDoc) {
        q = query(q, startAfter(options.lastDoc));
      }

      if (options?.limit) {
        q = query(q, limit(options.limit));
      } else {
        q = query(q, limit(20)); // Default limit
      }

      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || doc.data().createdAt || Date.now(),
        updatedAt: doc.data().updatedAt?.toMillis() || doc.data().updatedAt || Date.now(),
      } as Review));

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];

      return {
        reviews,
        lastDoc: snapshot.docs.length === (options?.limit || 20) ? lastDoc : undefined,
      };
    } catch (error: any) {
      throw new Error(`Failed to get kennel reviews: ${error.message}`);
    }
  }

  /**
   * Get average rating for a kennel
   */
  async getKennelAverageRating(kennelId: string): Promise<{ average: number; count: number }> {
    try {
      const reviewsRef = collection(this.firestore, COLLECTIONS.REVIEWS);
      const q = query(reviewsRef, where('kennelId', '==', kennelId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { average: 0, count: 0 };
      }

      let totalRating = 0;
      snapshot.docs.forEach((doc) => {
        totalRating += doc.data().rating || 0;
      });

      const average = totalRating / snapshot.docs.length;
      return {
        average: Math.round(average * 10) / 10, // Round to 1 decimal
        count: snapshot.docs.length,
      };
    } catch (error: any) {
      throw new Error(`Failed to get kennel average rating: ${error.message}`);
    }
  }

  /**
   * Get reviews by user
   */
  async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const reviewsRef = collection(this.firestore, COLLECTIONS.REVIEWS);
      const q = query(reviewsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || doc.data().createdAt || Date.now(),
        updatedAt: doc.data().updatedAt?.toMillis() || doc.data().updatedAt || Date.now(),
      } as Review));
    } catch (error: any) {
      throw new Error(`Failed to get user reviews: ${error.message}`);
    }
  }
}

// Export singleton instance
export const reviewRepository = new ReviewRepository();

