import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';
import { PetConsent } from '../models/petConsent';

export class PetConsentRepository {
  private firestore = getFirestoreInstance();

  /**
   * Check if consent exists for a pet and veterinarian/clinic
   */
  async checkConsent(
    petId: string,
    veterinarianId?: string,
    clinicId?: string
  ): Promise<PetConsent | null> {
    try {
      const consentsRef = collection(this.firestore, COLLECTIONS.PET_CONSENTS);
      let q = query(
        consentsRef,
        where('petId', '==', petId),
        where('granted', '==', true)
      );

      if (veterinarianId) {
        q = query(
          consentsRef,
          where('petId', '==', petId),
          where('veterinarianId', '==', veterinarianId),
          where('granted', '==', true)
        );
      } else if (clinicId) {
        q = query(
          consentsRef,
          where('petId', '==', petId),
          where('clinicId', '==', clinicId),
          where('granted', '==', true)
        );
      }

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      // Check if consent is still valid (not expired)
      const now = Date.now();
      for (const doc of snapshot.docs) {
        const consent = doc.data();
        const expiresAt = consent.expiresAt?.toMillis() || consent.expiresAt;
        if (!expiresAt || expiresAt > now) {
          return {
            id: doc.id,
            ...consent,
            grantedAt: consent.grantedAt?.toMillis() || consent.grantedAt || Date.now(),
            expiresAt,
            createdAt: consent.createdAt?.toMillis() || Date.now(),
            updatedAt: consent.updatedAt?.toMillis() || Date.now(),
          } as PetConsent;
        }
      }

      return null;
    } catch (error: any) {
      throw new Error(`Failed to check consent: ${error.message}`);
    }
  }

  /**
   * Create a consent record
   */
  async createConsent(consent: Omit<PetConsent, 'id' | 'createdAt' | 'updatedAt'>): Promise<PetConsent> {
    try {
      const consentsRef = collection(this.firestore, COLLECTIONS.PET_CONSENTS);
      const consentData = {
        ...consent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(consentsRef, consentData);

      return {
        id: docRef.id,
        ...consent,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    } catch (error: any) {
      throw new Error(`Failed to create consent: ${error.message}`);
    }
  }

  /**
   * Get all consents for a pet
   */
  async getPetConsents(petId: string): Promise<PetConsent[]> {
    try {
      const consentsRef = collection(this.firestore, COLLECTIONS.PET_CONSENTS);
      const q = query(consentsRef, where('petId', '==', petId));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        grantedAt: doc.data().grantedAt?.toMillis() || doc.data().grantedAt,
        expiresAt: doc.data().expiresAt?.toMillis() || doc.data().expiresAt,
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
        updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
      } as PetConsent));
    } catch (error: any) {
      throw new Error(`Failed to get pet consents: ${error.message}`);
    }
  }
}

// Export singleton instance
export const petConsentRepository = new PetConsentRepository();

