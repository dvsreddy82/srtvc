/**
 * Booking Service
 * Handles kennel booking creation with Firestore transactions
 */

import { runTransaction, collection } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { Booking } from '../models/booking';
import { COLLECTIONS } from '../utils/constants';
import { bookingRepository } from '../repositories/bookingRepository';
import { kennelRepository } from '../repositories/kennelRepository';
import { serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';

export interface CreateBookingData {
  userId: string;
  petId: string;
  kennelId: string;
  runId: string;
  startDate: number;
  endDate: number;
  totalAmount: number;
}

export class BookingService {
  private firestore = getFirestoreInstance();

  /**
   * Create a booking with atomic transaction (updates availability)
   */
  async createBooking(data: CreateBookingData): Promise<Booking> {
    try {
      // Use Firestore transaction to ensure atomicity
      const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = Date.now();

      const booking: Booking = {
        id: bookingId,
        userId: data.userId,
        petId: data.petId,
        kennelId: data.kennelId,
        runId: data.runId,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'pending',
        totalAmount: data.totalAmount,
        paymentStatus: 'pending',
        createdAt: now,
        updatedAt: now,
      };

      // Transaction: Create booking + Update availability
      await runTransaction(this.firestore, async (transaction) => {
        // 1. Check and update kennel run availability
        const runRef = doc(this.firestore, COLLECTIONS.KENNEL_RUNS, data.runId);
        const runDoc = await transaction.get(runRef);

        if (!runDoc.exists()) {
          throw new Error('Kennel run not found');
        }

        const runData = runDoc.data();
        const currentAvailable = runData.available || 0;

        if (currentAvailable <= 0) {
          throw new Error('No available slots in this kennel run');
        }

        // Decrease availability
        transaction.update(runRef, {
          available: currentAvailable - 1,
          updatedAt: serverTimestamp(),
        });

        // 2. Create booking document
        const bookingRef = doc(this.firestore, COLLECTIONS.BOOKINGS, bookingId);
        transaction.set(bookingRef, {
          ...booking,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      // 3. Save booking locally (optimistic)
      await bookingRepository.saveBookingLocally(booking);

      return booking;
    } catch (error: any) {
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      // Try local first
      const localBookings = await bookingRepository.getBookingsLocally();
      const localBooking = localBookings.find((b) => b.id === bookingId);

      if (localBooking) {
        // Trigger background sync
        this.syncBookingFromCloud(bookingId).catch(console.error);
        return localBooking;
      }

      // Fetch from Firestore if not in local
      const bookingRef = doc(this.firestore, COLLECTIONS.BOOKINGS, bookingId);
      const bookingDoc = await getDoc(bookingRef);

      if (!bookingDoc.exists()) {
        return null;
      }

      const bookingData = bookingDoc.data();
      const booking: Booking = {
        id: bookingDoc.id,
        ...bookingData,
        createdAt: bookingData.createdAt?.toMillis() || Date.now(),
        updatedAt: bookingData.updatedAt?.toMillis() || Date.now(),
      } as Booking;

      await bookingRepository.saveBookingLocally(booking);
      return booking;
    } catch (error: any) {
      throw new Error(`Failed to get booking: ${error.message}`);
    }
  }

  /**
   * Get all bookings for a user (local-first: sync once, never re-read past bookings)
   */
  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      // 1. Read from local cache (instant, no cloud read)
      const localBookings = await bookingRepository.getBookingsLocally(userId);

      // 2. Return immediately (optimistic)
      if (localBookings.length > 0) {
        // Only sync active bookings (not past bookings)
        const now = Date.now();
        const activeBookings = localBookings.filter(
          (b) => b.status !== 'checked-out' && b.endDate >= now
        );
        
        // Trigger background sync only for active bookings (non-blocking)
        if (activeBookings.length > 0) {
          this.syncUserBookingsFromCloud(userId).catch(console.error);
        }
        return localBookings.sort((a, b) => b.createdAt - a.createdAt);
      }

      // 3. If no local data, fetch from cloud (first time only - sync once)
      const cloudBookings = await this.fetchUserBookingsFromCloud(userId);
      for (const booking of cloudBookings) {
        await bookingRepository.saveBookingLocally(booking);
      }
      return cloudBookings;
    } catch (error: any) {
      throw new Error(`Failed to get bookings: ${error.message}`);
    }
  }

  /**
   * Sync booking from Firestore
   */
  private async syncBookingFromCloud(bookingId: string): Promise<void> {
    try {
      const bookingRef = doc(this.firestore, COLLECTIONS.BOOKINGS, bookingId);
      const bookingDoc = await getDoc(bookingRef);

      if (bookingDoc.exists()) {
        const bookingData = bookingDoc.data();
        const booking: Booking = {
          id: bookingDoc.id,
          ...bookingData,
          createdAt: bookingData.createdAt?.toMillis() || Date.now(),
          updatedAt: bookingData.updatedAt?.toMillis() || Date.now(),
        } as Booking;

        await bookingRepository.saveBookingLocally(booking);
      }
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  /**
   * Fetch user bookings from Firestore
   */
  private async fetchUserBookingsFromCloud(userId: string): Promise<Booking[]> {
    const { query, where, orderBy, getDocs } = await import('firebase/firestore');
    const bookingsRef = collection(this.firestore, COLLECTIONS.BOOKINGS);
    const q = query(
      bookingsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toMillis() || Date.now(),
      updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
    } as Booking));
  }

  /**
   * Sync user bookings from Firestore
   */
  private async syncUserBookingsFromCloud(userId: string): Promise<void> {
    try {
      const cloudBookings = await this.fetchUserBookingsFromCloud(userId);
      for (const booking of cloudBookings) {
        await bookingRepository.saveBookingLocally(booking);
      }
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
}

// Export singleton instance
export const bookingService = new BookingService();

