/**
 * System Monitoring Service
 * Handles system health monitoring and logs
 */

import { collection, query, orderBy, getDocs, limit, where, Timestamp } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';

export interface SystemMetric {
  id: string;
  metricType: 'firestore_reads' | 'firestore_writes' | 'storage_uploads' | 'function_invocations' | 'error_count';
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, any>;
  timestamp: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  metrics: {
    firestoreReads: number;
    firestoreWrites: number;
    storageUploads: number;
    functionInvocations: number;
    errorCount: number;
  };
  lastUpdated: number;
}

export class SystemMonitoringService {
  private firestore = getFirestoreInstance();

  /**
   * Get recent audit logs
   */
  async getRecentAuditLogs(limitCount: number = 100): Promise<AuditLog[]> {
    try {
      const logsRef = collection(this.firestore, COLLECTIONS.ADMIN_AUDIT_LOGS);
      const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toMillis() || doc.data().timestamp || Date.now(),
      } as AuditLog));
    } catch (error: any) {
      throw new Error(`Failed to get audit logs: ${error.message}`);
    }
  }

  /**
   * Get system metrics (last 24 hours)
   */
  async getSystemMetrics(): Promise<SystemMetric[]> {
    try {
      const metricsRef = collection(this.firestore, COLLECTIONS.SYSTEM_METRICS);
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      const q = query(
        metricsRef,
        where('timestamp', '>=', Timestamp.fromMillis(twentyFourHoursAgo)),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toMillis() || doc.data().timestamp || Date.now(),
      } as SystemMetric));
    } catch (error: any) {
      throw new Error(`Failed to get system metrics: ${error.message}`);
    }
  }

  /**
   * Get system health summary
   */
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const metrics = await this.getSystemMetrics();
      
      // Aggregate metrics by type
      const aggregated: Record<string, number> = {
        firestore_reads: 0,
        firestore_writes: 0,
        storage_uploads: 0,
        function_invocations: 0,
        error_count: 0,
      };

      metrics.forEach((metric) => {
        if (aggregated[metric.metricType] !== undefined) {
          aggregated[metric.metricType] += metric.value;
        }
      });

      // Determine health status (simplified logic)
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (aggregated.error_count > 100) {
        status = 'unhealthy';
      } else if (aggregated.error_count > 50) {
        status = 'degraded';
      }

      return {
        status,
        metrics: {
          firestoreReads: aggregated.firestore_reads,
          firestoreWrites: aggregated.firestore_writes,
          storageUploads: aggregated.storage_uploads,
          functionInvocations: aggregated.function_invocations,
          errorCount: aggregated.error_count,
        },
        lastUpdated: Date.now(),
      };
    } catch (error: any) {
      throw new Error(`Failed to get system health: ${error.message}`);
    }
  }
}

// Export singleton instance
export const systemMonitoringService = new SystemMonitoringService();

