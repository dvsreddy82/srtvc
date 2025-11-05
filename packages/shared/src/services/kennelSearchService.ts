/**
 * Kennel Search Service
 * Performs local-first search with real-time availability checks
 */

import { kennelRepository } from '../repositories/kennelRepository';
import { KennelSearchFilters, KennelSearchResult } from '../models/kennel';
import { bookingRepository } from '../repositories/bookingRepository';

export class KennelSearchService {
  /**
   * Search available kennels based on filters (local-first)
   */
  async searchKennels(filters: KennelSearchFilters): Promise<KennelSearchResult[]> {
    // 1. Get all kennels and runs from local storage (instant, no cloud read)
    const kennelsWithRuns = await kennelRepository.getKennelsWithRuns();

    // 2. Filter kennels locally based on search criteria
    let filteredKennels = kennelsWithRuns;

    // Filter by location
    if (filters.city) {
      filteredKennels = filteredKennels.filter((k) =>
        k.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    if (filters.state) {
      filteredKennels = filteredKennels.filter((k) =>
        k.state?.toLowerCase() === filters.state!.toLowerCase()
      );
    }

    // 3. Filter runs by size category and other criteria
    const results: KennelSearchResult[] = [];

    for (const kennelWithRuns of filteredKennels) {
      let availableRuns = kennelWithRuns.runs;

      // Filter by size category
      if (filters.sizeCategory) {
        availableRuns = availableRuns.filter(
          (run) => run.sizeCategory === filters.sizeCategory
        );
      }

      // Filter by price range
      if (filters.minPrice !== undefined) {
        availableRuns = availableRuns.filter(
          (run) => run.pricePerDay >= filters.minPrice!
        );
      }

      if (filters.maxPrice !== undefined) {
        availableRuns = availableRuns.filter(
          (run) => run.pricePerDay <= filters.maxPrice!
        );
      }

      // Filter by amenities
      if (filters.amenities && filters.amenities.length > 0) {
        availableRuns = availableRuns.filter((run) =>
          filters.amenities!.some((amenity) =>
            run.amenities?.includes(amenity)
          )
        );
      }

      // Check availability for the date range
      const runsWithAvailability = await this.checkAvailabilityForDates(
        availableRuns,
        filters.startDate,
        filters.endDate
      );

      if (runsWithAvailability.length > 0) {
        const days = Math.ceil(
          (filters.endDate - filters.startDate) / (24 * 60 * 60 * 1000)
        );
        const totalPrice = runsWithAvailability.reduce(
          (sum, run) => sum + run.pricePerDay * days,
          0
        );

        results.push({
          kennel: kennelWithRuns,
          runs: kennelWithRuns.runs,
          availableRuns: runsWithAvailability,
          totalPrice,
        });
      }
    }

    // 4. Sort by price or rating
    results.sort((a, b) => {
      if (a.totalPrice !== b.totalPrice) {
        return a.totalPrice - b.totalPrice;
      }
      return (b.kennel.rating || 0) - (a.kennel.rating || 0);
    });

    return results;
  }

  /**
   * Check availability for specific date range (local calculation)
   */
  private async checkAvailabilityForDates(
    runs: any[],
    startDate: number,
    endDate: number
  ): Promise<any[]> {
    // Get bookings from local storage for this date range
    // This is a simplified check - in production, you'd query bookings for overlaps
    const availableRuns: any[] = [];

    for (const run of runs) {
      // For now, use the cached availability
      // In a real implementation, you'd check local bookings for date overlaps
      if (run.available > 0) {
        // Optionally check real-time availability from Firestore (minimal reads)
        try {
          const realTimeAvailability = await kennelRepository.getRealTimeAvailability(
            run.id
          );
          if (realTimeAvailability > 0) {
            availableRuns.push({ ...run, available: realTimeAvailability });
          }
        } catch {
          // Fallback to local availability if real-time check fails
          availableRuns.push(run);
        }
      }
    }

    return availableRuns;
  }
}

// Export singleton instance
export const kennelSearchService = new KennelSearchService();

