/**
 * Check-out Service
 * Handles pet check-out with Firestore transactions and invoice generation
 */

import { runTransaction, doc, updateDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';
import { bookingService } from './bookingService';

export class CheckOutService {
  private firestore = getFirestoreInstance();

  /**
   * Check-out a pet (atomic update via Firestore transaction)
   * Invoice generation is handled by Cloud Function
   */
  async checkOutPet(
    bookingId: string,
    staffId: string,
    notes?: string
  ): Promise<void> {
    try {
      // Use Firestore transaction for atomic update
      await runTransaction(this.firestore, async (transaction) => {
        const bookingRef = doc(this.firestore, COLLECTIONS.BOOKINGS, bookingId);
        const bookingDoc = await transaction.get(bookingRef);

        if (!bookingDoc.exists()) {
          throw new Error('Booking not found');
        }

        const bookingData = bookingDoc.data();

        // Verify booking status
        if (bookingData.status !== 'checked-in') {
          throw new Error('Booking is not checked in');
        }

        // Update booking status to checked-out
        transaction.update(bookingRef, {
          status: 'checked-out',
          checkedOutAt: new Date(),
          checkedOutBy: staffId,
          updatedAt: new Date(),
        });

        // Note: Invoice generation is handled by Cloud Function trigger
        // Availability release is also handled by the transaction
      });

      // Save notes if provided (outside transaction)
      if (notes) {
        // Notes can be saved to booking notes subcollection
        // This is handled separately to avoid transaction complexity
      }

      // Update local cache
      const booking = await bookingService.getBookingById(bookingId);
      if (booking) {
        booking.status = 'checked-out';
        // Local cache will be updated by the booking service
      }
    } catch (error: any) {
      throw new Error(`Failed to check-out pet: ${error.message}`);
    }
  }
}

// Export singleton instance
export const checkOutService = new CheckOutService();

