/**
 * Image Service - Web Implementation
 * Handles image compression and upload to Firebase Storage
 */

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorageInstance } from '../config/firebase';
import { IMAGE_CONFIG, STORAGE_PATHS } from '../utils/constants';

// Dynamic import for browser-image-compression (client-side only)
let imageCompression: any = null;

async function getImageCompression() {
  if (!imageCompression && typeof window !== 'undefined') {
    try {
      // @ts-ignore - Dynamic import for optional dependency
      imageCompression = (await import('browser-image-compression')).default;
    } catch (error) {
      console.warn('browser-image-compression not available, image compression will be skipped');
      return null;
    }
  }
  return imageCompression;
}

export class ImageService {
  /**
   * Compress image before upload (Web)
   */
  async compressImage(file: File): Promise<File> {
    const compression = await getImageCompression();
    if (!compression) {
      throw new Error('Image compression not available');
    }

    try {
      const compressedFile = await compression(file, {
        maxSizeMB: IMAGE_CONFIG.MAX_SIZE_MB,
        maxWidthOrHeight: IMAGE_CONFIG.MAX_WIDTH,
        useWebWorker: true,
        fileType: 'image/jpeg',
      });

      return compressedFile;
    } catch (error: any) {
      throw new Error(`Image compression failed: ${error.message}`);
    }
  }

  /**
   * Upload pet photo to Firebase Storage
   */
  async uploadPetPhoto(
    file: File,
    userId: string,
    petId: string
  ): Promise<string> {
    try {
      // Compress image first
      const compressedFile = await this.compressImage(file);

      // Upload to Firebase Storage
      const storage = getStorageInstance();
      const timestamp = Date.now();
      const fileName = `${timestamp}.jpg`;
      const storageRef = ref(
        storage,
        `${STORAGE_PATHS.PET_PHOTOS}/${userId}/${petId}/${fileName}`
      );

      await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    } catch (error: any) {
      throw new Error(`Photo upload failed: ${error.message}`);
    }
  }

  /**
   * Upload vaccine document to Firebase Storage
   */
  async uploadVaccineDocument(
    file: File,
    userId: string,
    petId: string,
    documentName: string
  ): Promise<string> {
    try {
      const storage = getStorageInstance();
      const timestamp = Date.now();
      const fileName = `${documentName}_${timestamp}.pdf`;
      const storageRef = ref(
        storage,
        `${STORAGE_PATHS.VACCINE_DOCUMENTS}/${userId}/${petId}/${fileName}`
      );

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    } catch (error: any) {
      throw new Error(`Document upload failed: ${error.message}`);
    }
  }
}

// Export singleton instance
export const imageService = new ImageService();

