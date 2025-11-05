import * as functions from 'firebase-functions';

// Export all cloud functions
export { onBookingCreate, onBookingUpdate } from './onBookingCreate';
export { onPhotoUpload } from './onPhotoUpload';
export { vaccineReminders } from './vaccineReminders';
export { veterinarianWebhook } from './veterinarianWebhook';
export { automatedBackup } from './automatedBackup';
export { exportData } from './exportData';
export { updateUserCustomClaims, sendPasswordResetEmail } from './userManagementFunctions';

