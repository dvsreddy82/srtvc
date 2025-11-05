/**
 * Staff Management Service
 * Handles staff permissions, assignments, and schedules
 * Note: Custom claims are set via Cloud Function (Admin SDK)
 */

import { collection, doc, setDoc, getDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';

export interface StaffAssignment {
  id: string;
  staffId: string;
  kennelId: string;
  role: 'staff' | 'manager';
  schedule?: {
    startTime: string;
    endTime: string;
    daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
  };
  createdAt: number;
  updatedAt: number;
}

export class StaffManagementService {
  private firestore = getFirestoreInstance();

  /**
   * Create or update staff assignment
   * Note: Custom claims must be set via Cloud Function
   */
  async saveStaffAssignment(
    assignment: Omit<StaffAssignment, 'id' | 'createdAt' | 'updatedAt'> | StaffAssignment
  ): Promise<StaffAssignment> {
    try {
      const assignmentsRef = collection(this.firestore, COLLECTIONS.STAFF_ASSIGNMENTS);
      
      if ('id' in assignment && assignment.id) {
        // Update existing assignment
        const assignmentRef = doc(assignmentsRef, assignment.id);
        await updateDoc(assignmentRef, {
          ...assignment,
          updatedAt: new Date(),
        });
        return {
          ...assignment,
          updatedAt: Date.now(),
        } as StaffAssignment;
      } else {
        // Create new assignment
        const assignmentData = {
          ...assignment,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const docRef = doc(assignmentsRef);
        await setDoc(docRef, assignmentData);
        return {
          id: docRef.id,
          ...assignment,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as StaffAssignment;
      }
    } catch (error: any) {
      throw new Error(`Failed to save staff assignment: ${error.message}`);
    }
  }

  /**
   * Get staff assignments for a kennel
   */
  async getStaffAssignments(kennelId: string): Promise<StaffAssignment[]> {
    try {
      const assignmentsRef = collection(this.firestore, COLLECTIONS.STAFF_ASSIGNMENTS);
      const q = query(assignmentsRef, where('kennelId', '==', kennelId));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
        updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
      } as StaffAssignment));
    } catch (error: any) {
      throw new Error(`Failed to get staff assignments: ${error.message}`);
    }
  }

  /**
   * Get staff assignment for a user
   */
  async getStaffAssignmentByUserId(staffId: string): Promise<StaffAssignment | null> {
    try {
      const assignmentsRef = collection(this.firestore, COLLECTIONS.STAFF_ASSIGNMENTS);
      const q = query(assignmentsRef, where('staffId', '==', staffId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
        updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
      } as StaffAssignment;
    } catch (error: any) {
      throw new Error(`Failed to get staff assignment: ${error.message}`);
    }
  }

  /**
   * Request custom claims update (triggers Cloud Function)
   * Note: This is a placeholder - actual implementation requires Cloud Function
   */
  async requestCustomClaimsUpdate(
    userId: string,
    role: 'staff' | 'manager',
    kennelId: string
  ): Promise<void> {
    // This would trigger a Cloud Function that sets custom claims via Admin SDK
    // For now, we'll just log it
    console.log(`Custom claims update requested for ${userId}: role=${role}, kennelId=${kennelId}`);
    // In production, this would call a Cloud Function HTTP endpoint
  }
}

// Export singleton instance
export const staffManagementService = new StaffManagementService();

