/**
 * Manager Service
 * Handles kennel management operations
 */

import { collection, doc, setDoc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';
import { kennelRepository } from '../repositories/kennelRepository';
import type { KennelRun } from '../models/kennel';

export class ManagerService {
  private firestore = getFirestoreInstance();

  /**
   * Create or update a kennel run
   */
  async saveKennelRun(kennelId: string, run: Omit<KennelRun, 'id' | 'createdAt' | 'updatedAt'> | KennelRun): Promise<KennelRun> {
    try {
      const runsRef = collection(this.firestore, COLLECTIONS.KENNEL_RUNS);
      
      if ('id' in run && run.id) {
        // Update existing run
        const runRef = doc(runsRef, run.id);
        await updateDoc(runRef, {
          ...run,
          updatedAt: new Date(),
        });
        return {
          ...run,
          updatedAt: Date.now(),
        } as KennelRun;
      } else {
        // Create new run
        const runData = {
          ...run,
          kennelId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const docRef = await addDoc(runsRef, runData);
        return {
          id: docRef.id,
          ...run,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as KennelRun;
      }
    } catch (error: any) {
      throw new Error(`Failed to save kennel run: ${error.message}`);
    }
  }

  /**
   * Delete a kennel run
   */
  async deleteKennelRun(runId: string): Promise<void> {
    try {
      const runRef = doc(this.firestore, COLLECTIONS.KENNEL_RUNS, runId);
      await deleteDoc(runRef);
    } catch (error: any) {
      throw new Error(`Failed to delete kennel run: ${error.message}`);
    }
  }

  /**
   * Get kennel runs for a kennel
   */
  async getKennelRuns(kennelId: string): Promise<KennelRun[]> {
    try {
      return await kennelRepository.getKennelRunsLocally(kennelId);
    } catch (error: any) {
      throw new Error(`Failed to get kennel runs: ${error.message}`);
    }
  }

  /**
   * Log audit entry for changes
   */
  async logAuditEntry(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const auditRef = collection(this.firestore, COLLECTIONS.ADMIN_AUDIT_LOGS);
      await addDoc(auditRef, {
        userId,
        action,
        resourceType,
        resourceId,
        details: details || {},
        timestamp: new Date(),
        createdAt: new Date(),
      });
    } catch (error: any) {
      console.error('Failed to log audit entry:', error);
      // Don't throw - audit logging shouldn't block operations
    }
  }
}

// Export singleton instance
export const managerService = new ManagerService();

