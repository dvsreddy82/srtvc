/**
 * Stay Update Service
 * Manages stay updates with 15-minute batch sync
 */

import { stayUpdateRepository } from '../repositories/stayUpdateRepository';
import { StayUpdate } from '../models/stayUpdate';

export class StayUpdateService {
  /**
   * Get stay updates for a booking (local-first)
   */
  async getStayUpdates(bookingId: string): Promise<StayUpdate[]> {
    return await stayUpdateRepository.getStayUpdates(bookingId);
  }

  /**
   * Manually trigger sync for a booking
   */
  async syncStayUpdates(bookingId: string): Promise<void> {
    await stayUpdateRepository.syncStayUpdatesFromCloud(bookingId);
  }

  /**
   * Start periodic sync for a booking (every 15 minutes)
   */
  startPeriodicSync(bookingId: string, callback?: (updates: StayUpdate[]) => void): () => void {
    const interval = 15 * 60 * 1000; // 15 minutes

    const sync = async () => {
      try {
        await stayUpdateRepository.syncStayUpdatesFromCloud(bookingId);
        if (callback) {
          const updates = await stayUpdateRepository.getStayUpdatesLocally(bookingId);
          callback(updates);
        }
      } catch (error) {
        console.error('Periodic sync failed:', error);
      }
    };

    // Initial sync
    sync();

    // Set up interval
    const intervalId = setInterval(sync, interval);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}

// Export singleton instance
export const stayUpdateService = new StayUpdateService();

