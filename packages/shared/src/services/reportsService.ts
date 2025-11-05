/**
 * Reports Service
 * Handles generating reports for bookings, occupancy, and revenue
 */

import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';

export interface ReportFilters {
  kennelId?: string;
  startDate: number;
  endDate: number;
}

export interface BookingReport {
  totalBookings: number;
  confirmedBookings: number;
  checkedInBookings: number;
  checkedOutBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
}

export interface OccupancyReport {
  date: number;
  totalCapacity: number;
  occupied: number;
  occupancyRate: number;
}

export class ReportsService {
  private firestore = getFirestoreInstance();

  /**
   * Get booking report with aggregations
   */
  async getBookingReport(filters: ReportFilters): Promise<BookingReport> {
    try {
      const bookingsRef = collection(this.firestore, COLLECTIONS.BOOKINGS);
      let q = query(
        bookingsRef,
        where('createdAt', '>=', Timestamp.fromMillis(filters.startDate)),
        where('createdAt', '<=', Timestamp.fromMillis(filters.endDate)),
        orderBy('createdAt', 'desc')
      );

      if (filters.kennelId) {
        q = query(
          bookingsRef,
          where('kennelId', '==', filters.kennelId),
          where('createdAt', '>=', Timestamp.fromMillis(filters.startDate)),
          where('createdAt', '<=', Timestamp.fromMillis(filters.endDate)),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map((doc) => doc.data());

      const totalBookings = bookings.length;
      const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
      const checkedInBookings = bookings.filter((b) => b.status === 'checked-in').length;
      const checkedOutBookings = bookings.filter((b) => b.status === 'checked-out').length;
      const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length;

      const totalRevenue = bookings
        .filter((b) => b.status !== 'cancelled')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      return {
        totalBookings,
        confirmedBookings,
        checkedInBookings,
        checkedOutBookings,
        cancelledBookings,
        totalRevenue,
        averageBookingValue,
      };
    } catch (error: any) {
      throw new Error(`Failed to get booking report: ${error.message}`);
    }
  }

  /**
   * Get occupancy report (daily breakdown)
   */
  async getOccupancyReport(filters: ReportFilters): Promise<OccupancyReport[]> {
    try {
      // This would require more complex queries or Cloud Function
      // For now, return a simplified version
      // In production, this should use daily summaries or Cloud Function aggregation
      return [];
    } catch (error: any) {
      throw new Error(`Failed to get occupancy report: ${error.message}`);
    }
  }

  /**
   * Export report to CSV (via Cloud Function)
   */
  async exportReportToCSV(filters: ReportFilters, reportType: 'bookings' | 'occupancy' | 'revenue'): Promise<string> {
    try {
      // This would call a Cloud Function endpoint
      // For now, return placeholder
      throw new Error('CSV export not yet implemented - requires Cloud Function');
    } catch (error: any) {
      throw new Error(`Failed to export report: ${error.message}`);
    }
  }
}

// Export singleton instance
export const reportsService = new ReportsService();

