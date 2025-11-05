import { collection, doc, getDoc, setDoc, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { COLLECTIONS } from '../utils/constants';
import { Breed, VaccineType } from '../models/masterData';

export class MasterDataRepository {
  private firestore = getFirestoreInstance();

  /**
   * Get all breeds
   */
  async getBreeds(species?: string): Promise<Breed[]> {
    try {
      const breedsRef = collection(this.firestore, `${COLLECTIONS.MASTER_DATA}/breeds/list`);
      let q = query(breedsRef, where('isActive', '==', true));

      if (species) {
        q = query(breedsRef, where('species', '==', species), where('isActive', '==', true));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
        updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
      } as Breed));
    } catch (error: any) {
      throw new Error(`Failed to get breeds: ${error.message}`);
    }
  }

  /**
   * Create or update a breed
   */
  async saveBreed(breed: Omit<Breed, 'id' | 'createdAt' | 'updatedAt'> | Breed): Promise<Breed> {
    try {
      const breedsRef = collection(this.firestore, `${COLLECTIONS.MASTER_DATA}/breeds/list`);

      if ('id' in breed && breed.id) {
        // Update existing
        const breedRef = doc(breedsRef, breed.id);
        await updateDoc(breedRef, {
          ...breed,
          updatedAt: new Date(),
        });
        return {
          ...breed,
          updatedAt: Date.now(),
        } as Breed;
      } else {
        // Create new
        const breedData = {
          ...breed,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const docRef = await addDoc(breedsRef, breedData);
        return {
          id: docRef.id,
          ...breed,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as Breed;
      }
    } catch (error: any) {
      throw new Error(`Failed to save breed: ${error.message}`);
    }
  }

  /**
   * Get all vaccine types
   */
  async getVaccineTypes(species?: string): Promise<VaccineType[]> {
    try {
      const vaccineTypesRef = collection(this.firestore, `${COLLECTIONS.MASTER_DATA}/vaccine_types/list`);
      let q = query(vaccineTypesRef, where('isActive', '==', true));

      if (species) {
        q = query(
          vaccineTypesRef,
          where('species', 'array-contains', species),
          where('isActive', '==', true)
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
        updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
      } as VaccineType));
    } catch (error: any) {
      throw new Error(`Failed to get vaccine types: ${error.message}`);
    }
  }

  /**
   * Create or update a vaccine type
   */
  async saveVaccineType(
    vaccineType: Omit<VaccineType, 'id' | 'createdAt' | 'updatedAt'> | VaccineType
  ): Promise<VaccineType> {
    try {
      const vaccineTypesRef = collection(this.firestore, `${COLLECTIONS.MASTER_DATA}/vaccine_types/list`);

      if ('id' in vaccineType && vaccineType.id) {
        // Update existing
        const vaccineTypeRef = doc(vaccineTypesRef, vaccineType.id);
        await updateDoc(vaccineTypeRef, {
          ...vaccineType,
          updatedAt: new Date(),
        });
        return {
          ...vaccineType,
          updatedAt: Date.now(),
        } as VaccineType;
      } else {
        // Create new
        const vaccineTypeData = {
          ...vaccineType,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const docRef = await addDoc(vaccineTypesRef, vaccineTypeData);
        return {
          id: docRef.id,
          ...vaccineType,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as VaccineType;
      }
    } catch (error: any) {
      throw new Error(`Failed to save vaccine type: ${error.message}`);
    }
  }
}

// Export singleton instance
export const masterDataRepository = new MasterDataRepository();

