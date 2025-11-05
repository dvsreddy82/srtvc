import { collection, doc, getDoc, query, where, getDocs, orderBy, serverTimestamp, setDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { Booking } from '../models/booking';
import { COLLECTIONS } from '../utils/constants';
import { localStorageService } from '../services/localStorageService';

export class BookingRepository {
  private firestore = getFirestoreInstance();

  /**
   * Save booking to local IndexedDB (primary storage)
   */
  async saveBookingLocally(booking: Booking): Promise<void> {
    try {
      await localStorageService.init();
      const db = (localStorageService as any).db;
      if (!db) return;

      if (!db.objectStoreNames.contains('bookings')) {
        return;
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['bookings'], 'readwrite');
        const store = transaction.objectStore('bookings');
        const request = store.put(booking);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error: any) {
      console.error('Failed to save booking locally:', error);
    }
  }

  /**
   * Get bookings from local IndexedDB (primary source)
   */
  async getBookingsLocally(userId?: string, runId?: string): Promise<Booking[]> {
    try {
      await localStorageService.init();
      const db = (localStorageService as any).db;
      if (!db) return [];

      if (!db.objectStoreNames.contains('bookings')) {
        return [];
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['bookings'], 'readonly');
        const store = transaction.objectStore('bookings');
        const request = store.getAll();

        request.onsuccess = () => {
          let bookings = request.result || [];
          
          if (userId) {
            bookings = bookings.filter((b: Booking) => b.userId === userId);
          }
          
          if (runId) {
            bookings = bookings.filter((b: Booking) => b.runId === runId);
          }
          
          resolve(bookings);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get bookings locally:', error);
      return [];
    }
  }

  /**
   * Get bookings for a date range (local query)
   */
  async getBookingsForDateRange(
    runId: string,
    startDate: number,
    endDate: number
  ): Promise<Booking[]> {
    const bookings = await this.getBookingsLocally(undefined, runId);
    
    return bookings.filter((booking) => {
      // Check if booking overlaps with date range
      return (
        booking.status !== 'cancelled' &&
        booking.status !== 'checked-out' &&
        booking.startDate < endDate &&
        booking.endDate > startDate
      );
    });
  }

  /**
   * Get bookings by kennel ID (local query)
   */
  async getBookingsByKennelId(kennelId: string): Promise<Booking[]> {
    const allBookings = await this.getBookingsLocally();
    return allBookings.filter((b) => b.kennelId === kennelId);
  }

  /**
   * Sync bookings for a kennel from Firestore (for staff morning sync)
   */
  async syncBookingsByKennelId(kennelId: string, dateRange?: { startDate: number; endDate: number }): Promise<void> {
    try {
      const bookingsRef = collection(this.firestore, COLLECTIONS.BOOKINGS);
      let q = query(
        bookingsRef,
        where('kennelId', '==', kennelId),
        orderBy('startDate', 'asc')
      );

      if (dateRange) {
        const { Timestamp } = await import('firebase/firestore');
        q = query(
          bookingsRef,
          where('kennelId', '==', kennelId),
          where('startDate', '>=', Timestamp.fromMillis(dateRange.startDate)),
          where('startDate', '<=', Timestamp.fromMillis(dateRange.endDate)),
          orderBy('startDate', 'asc')
        );
      }

      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toMillis() || doc.data().startDate || Date.now(),
        endDate: doc.data().endDate?.toMillis() || doc.data().endDate || Date.now(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
        updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
      } as Booking));

      // Save to local cache
      for (const booking of bookings) {
        await this.saveBookingLocally(booking);
      }
    } catch (error: any) {
      console.error('Failed to sync bookings by kennel:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const bookingRepository = new BookingRepository();

