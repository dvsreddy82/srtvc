/**
 * Export Service
 * Client-side service for calling export Cloud Function
 */

import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseApp } from '../config/firebase';

export interface ExportOptions {
  collectionName: string;
  filters?: Record<string, any>;
  format?: 'csv' | 'json';
}

export interface ExportResult {
  success: boolean;
  csv?: string;
  downloadUrl?: string;
  fileName?: string;
  data?: any[];
  count: number;
}

export class ExportService {
  /**
   * Export collection data to CSV or JSON
   */
  async exportData(options: ExportOptions): Promise<ExportResult> {
    try {
      const app = getFirebaseApp();
      const functions = getFunctions(app);
      const exportDataFunction = httpsCallable<ExportOptions, ExportResult>(
        functions,
        'exportData'
      );

      const result = await exportDataFunction(options);
      return result.data;
    } catch (error: any) {
      throw new Error(`Failed to export data: ${error.message}`);
    }
  }
}

// Export singleton instance
export const exportService = new ExportService();

