/**
 * Staff Service
 * Handles staff operations like viewing today's check-ins
 */

import { bookingRepository } from '../repositories/bookingRepository';
import { Booking } from '../models/booking';

export class StaffService {
  /**
   * Get today's scheduled check-ins (local-first: sync once in morning, refresh on status change)
   */
  async getTodayCheckIns(kennelId: string): Promise<Booking[]> {
    try {
      // 1. Get all bookings from local cache (instant, no cloud read)
      const allBookings = await bookingRepository.getBookingsByKennelId(kennelId);

      // 2. Filter for today's check-ins
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const todayStartTime = todayStart.getTime();
      const todayEndTime = todayEnd.getTime();

      const todayCheckIns = allBookings.filter((booking) => {
        const checkInDate = booking.startDate;
        return (
          (booking.status === 'confirmed' || booking.status === 'pending') &&
          checkInDate >= todayStartTime &&
          checkInDate <= todayEndTime
        );
      });

      // 3. Sort by check-in time
      return todayCheckIns.sort((a, b) => a.startDate - b.startDate);
    } catch (error: any) {
      throw new Error(`Failed to get today's check-ins: ${error.message}`);
    }
  }

  /**
   * Sync today's check-ins from Firestore (morning sync)
   */
  async syncTodayCheckIns(kennelId: string): Promise<void> {
    try {
      // Sync bookings for the current date range
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // Sync bookings from Firestore to local cache
      await bookingRepository.syncBookingsByKennelId(kennelId, {
        startDate: todayStart.getTime(),
        endDate: todayEnd.getTime(),
      });
    } catch (error: any) {
      throw new Error(`Failed to sync today's check-ins: ${error.message}`);
    }
  }

  /**
   * Get active bookings (checked-in, not checked-out)
   */
  async getActiveBookings(kennelId: string): Promise<Booking[]> {
    try {
      const allBookings = await bookingRepository.getBookingsByKennelId(kennelId);
      
      return allBookings
        .filter((booking) => booking.status === 'checked-in')
        .sort((a, b) => a.startDate - b.startDate);
    } catch (error: any) {
      throw new Error(`Failed to get active bookings: ${error.message}`);
    }
  }
}

// Export singleton instance
export const staffService = new StaffService();

