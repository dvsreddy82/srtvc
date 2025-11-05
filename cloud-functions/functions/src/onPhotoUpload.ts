import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const onPhotoUpload = functions.storage
  .object()
  .onFinalize(async (object) => {
    const filePath = object.name;
    const contentType = object.contentType;

    if (!filePath || !contentType) {
      return null;
    }

    try {
      // Handle medical record documents (vaccine documents)
      if (filePath.includes('vaccine_documents/')) {
        // Extract metadata from path: vaccine_documents/{userId}/{petId}/{filename}
        const pathParts = filePath.split('/');
        if (pathParts.length >= 4) {
          const userId = pathParts[1];
          const petId = pathParts[2];

          // Generate thumbnail if it's an image
          if (contentType.startsWith('image/')) {
            // Thumbnail generation will be implemented
            // For now, just log
            console.log(`Vaccine document image uploaded: ${filePath}`);
          }

          // Metadata is already stored via medical record creation
          // Cloud Function can update with thumbnail URL if needed
        }
      }

      // Handle pet photos
      if (filePath.includes('pet_photos/') && contentType.startsWith('image/')) {
        // Generate thumbnail for pet photos
        // Implementation will be added
        console.log(`Pet photo uploaded: ${filePath}`);
      }

      // Handle stay photos
      if (filePath.includes('stay_photos/') && contentType.startsWith('image/')) {
        // Extract booking ID from path: stay_photos/{bookingId}/{filename}
        const pathParts = filePath.split('/');
        if (pathParts.length >= 3) {
          const bookingId = pathParts[1];
          
          // Generate thumbnail for stay photos
          // Implementation will be added
          console.log(`Stay photo uploaded for booking ${bookingId}: ${filePath}`);
          
          // Send FCM notification to pet owner
          // This will be handled by the stay update creation, but we can also trigger here
        }
      }

      return null;
    } catch (error) {
      console.error(`Error processing photo ${filePath}:`, error);
      throw error;
    }
  });

