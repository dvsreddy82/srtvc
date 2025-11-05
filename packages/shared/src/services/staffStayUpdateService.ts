/**
 * Staff Stay Update Service
 * Handles uploading daily photos and notes during a pet's stay
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestoreInstance, getStorageInstance } from '../config/firebase';
import { COLLECTIONS, STORAGE_PATHS } from '../utils/constants';
import { imageService } from './imageService';
import { StayUpdate } from '../models/stayUpdate';

export class StaffStayUpdateService {
  private firestore = getFirestoreInstance();
  private storage = getStorageInstance();

  /**
   * Upload stay update with photos and notes
   */
  async uploadStayUpdate(
    bookingId: string,
    staffId: string,
    staffName: string,
    type: StayUpdate['type'],
    content?: string,
    photos?: File[]
  ): Promise<StayUpdate> {
    try {
      let photoURLs: string[] = [];

      // Upload and compress photos if provided
      if (photos && photos.length > 0) {
        const uploadPromises = photos.map(async (photo) => {
          // Compress image client-side
          const compressedFile = await imageService.compressImage(photo);
          
          // Generate unique filename
          const timestamp = Date.now();
          const filename = `${timestamp}_${compressedFile.name}`;
          const storagePath = `${STORAGE_PATHS.STAY_PHOTOS}/${bookingId}/${filename}`;
          const storageRef = ref(this.storage, storagePath);

          // Upload to Firebase Storage
          await uploadBytes(storageRef, compressedFile);
          
          // Get download URL
          const downloadURL = await getDownloadURL(storageRef);
          return downloadURL;
        });

        photoURLs = await Promise.all(uploadPromises);
      }

      // Create stay update document in Firestore
      const updatesRef = collection(this.firestore, COLLECTIONS.STAY_UPDATES);
      const updateData = {
        bookingId,
        type,
        content: content || '',
        photoURLs,
        timestamp: serverTimestamp(),
        staffId,
        staffName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(updatesRef, updateData);

      return {
        id: docRef.id,
        bookingId,
        type,
        content,
        photoURLs,
        timestamp: Date.now(),
        staffId,
        staffName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    } catch (error: any) {
      throw new Error(`Failed to upload stay update: ${error.message}`);
    }
  }
}

// Export singleton instance
export const staffStayUpdateService = new StaffStayUpdateService();

