/**
 * Check-in Service
 * Handles pet check-in with Firestore transactions
 */

import { runTransaction, doc, updateDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';
import { bookingNoteRepository } from '../repositories/bookingNoteRepository';
import { bookingService } from './bookingService';

export class CheckInService {
  private firestore = getFirestoreInstance();

  /**
   * Check-in a pet (atomic update via Firestore transaction)
   */
  async checkInPet(
    bookingId: string,
    staffId: string,
    condition?: string,
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
        if (bookingData.status !== 'confirmed' && bookingData.status !== 'pending') {
          throw new Error('Booking is not in a valid state for check-in');
        }

        // Update booking status to checked-in
        transaction.update(bookingRef, {
          status: 'checked-in',
          checkedInAt: new Date(),
          checkedInBy: staffId,
          updatedAt: new Date(),
        });

        // Save condition and notes if provided
        if (condition || notes) {
          const noteContent = [condition, notes].filter(Boolean).join('\n\n');
          // Note will be saved after transaction (not in transaction to avoid complexity)
          // We'll save it separately
        }
      });

      // Save notes outside transaction (if provided)
      if (condition || notes) {
        const noteContent = [condition, notes].filter(Boolean).join('\n\n');
        await bookingNoteRepository.createNote(
          bookingId,
          staffId,
          'staff',
          `Check-in: ${noteContent}`
        );
      }

      // Update local cache
      const booking = await bookingService.getBookingById(bookingId);
      if (booking) {
        booking.status = 'checked-in';
        // Local cache will be updated by the booking service
      }
    } catch (error: any) {
      throw new Error(`Failed to check-in pet: ${error.message}`);
    }
  }
}

// Export singleton instance
export const checkInService = new CheckInService();

