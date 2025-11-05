/**
 * Mobile Image Service
 * Uses react-native-image-resizer for compression
 */

import ImageResizer from 'react-native-image-resizer';
import storage from '@react-native-firebase/storage';
import type { ImagePickerResponse } from 'react-native-image-picker';
import { STORAGE_PATHS } from '@pet-management/shared';

export class MobileImageService {
  /**
   * Compress image for mobile (React Native)
   */
  async compressImage(imageUri: string): Promise<string> {
    try {
      const resizedImage = await ImageResizer.createResizedImage(
        imageUri,
        1920, // maxWidth
        1920, // maxHeight
        'JPEG',
        80, // quality (0-100)
        0, // rotation
        undefined, // outputPath
        false, // keepMeta
        {
          mode: 'contain',
          onlyScaleDown: true,
        }
      );

      return resizedImage.uri;
    } catch (error: any) {
      throw new Error(`Image compression failed: ${error.message}`);
    }
  }

  /**
   * Upload pet photo to Firebase Storage
   */
  async uploadPetPhoto(
    imageAsset: ImagePickerResponse['assets'][0],
    userId: string,
    petId: string
  ): Promise<string> {
    try {
      if (!imageAsset?.uri) {
        throw new Error('No image selected');
      }

      // Compress image first
      const compressedUri = await this.compressImage(imageAsset.uri);

      // Read file as blob
      const response = await fetch(compressedUri);
      const blob = await response.blob();

      // Upload to Firebase Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}.jpg`;
      const storageRef = storage().ref(
        `${STORAGE_PATHS.PET_PHOTOS}/${userId}/${petId}/${fileName}`
      );

      await storageRef.put(blob);
      const downloadURL = await storageRef.getDownloadURL();

      return downloadURL;
    } catch (error: any) {
      throw new Error(`Photo upload failed: ${error.message}`);
    }
  }

  /**
   * Upload vaccine document
   */
  async uploadVaccineDocument(
    fileUri: string,
    userId: string,
    petId: string,
    documentName: string
  ): Promise<string> {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const timestamp = Date.now();
      const fileName = `${documentName}_${timestamp}.pdf`;
      const storageRef = storage().ref(
        `${STORAGE_PATHS.VACCINE_DOCUMENTS}/${userId}/${petId}/${fileName}`
      );

      await storageRef.put(blob);
      const downloadURL = await storageRef.getDownloadURL();

      return downloadURL;
    } catch (error: any) {
      throw new Error(`Document upload failed: ${error.message}`);
    }
  }
}

export const imageService = new MobileImageService();

