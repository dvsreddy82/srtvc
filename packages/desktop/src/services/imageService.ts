/**
 * Desktop Image Service
 * Handles image compression and upload for Electron
 * Note: Image operations can be done in renderer or via IPC
 */

import { nativeImage } from 'electron';
import * as sharp from 'sharp';

export class DesktopImageService {
  /**
   * Compress image for desktop
   */
  async compressImage(imagePath: string): Promise<Buffer> {
    try {
      const image = nativeImage.createFromPath(imagePath);
      if (image.isEmpty()) {
        throw new Error('Invalid image file');
      }

      // Use sharp for better compression
      const compressed = await sharp(imagePath)
        .resize(IMAGE_CONFIG.MAX_WIDTH, IMAGE_CONFIG.MAX_WIDTH, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      return compressed;
    } catch (error: any) {
      throw new Error(`Image compression failed: ${error.message}`);
    }
  }

  /**
   * Upload pet photo to Firebase Storage
   * Note: Upload is typically done in renderer, but can be done via IPC
   */
  async uploadPetPhoto(
    imagePath: string,
    userId: string,
    petId: string
  ): Promise<Buffer> {
    try {
      // Compress image and return buffer
      // Upload to Firebase is handled in renderer process
      return await this.compressImage(imagePath);
    } catch (error: any) {
      throw new Error(`Photo compression failed: ${error.message}`);
    }
  }

  /**
   * Compress image for upload
   * Returns compressed buffer ready for upload
   */
  async compressImageForUpload(imagePath: string): Promise<Buffer> {
    return await this.compressImage(imagePath);
  }
}

export const imageService = new DesktopImageService();

