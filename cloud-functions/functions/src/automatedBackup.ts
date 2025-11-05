/**
 * Automated Backup Cloud Function
 * Weekly backup of Firestore data to Cloud Storage
 * Triggered by Cloud Scheduler
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const firestore = admin.firestore();

export const automatedBackup = functions.pubsub
  .schedule('0 2 * * 0') // Every Sunday at 2 AM
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `backup-${timestamp}`;
      const bucketName = functions.config().backup?.bucket_name || 'pet-management-backups';

      // Export all collections
      const collections = [
        'users',
        'pets',
        'medical_records',
        'vaccines',
        'kennels',
        'kennel_runs',
        'bookings',
        'stay_updates',
        'invoices',
        'reviews',
        'pet_consents',
        'staff_assignments',
        'admin_audit_logs',
      ];

      const backupData: Record<string, any[]> = {};

      for (const collectionName of collections) {
        try {
          const snapshot = await firestore.collection(collectionName).get();
          backupData[collectionName] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        } catch (error: any) {
          console.error(`Failed to backup collection ${collectionName}:`, error);
          // Continue with other collections
        }
      }

      // Store backup in Cloud Storage
      const storage = admin.storage();
      const bucket = storage.bucket(bucketName);

      // Create backup file as JSON
      const fileName = `${backupName}/backup.json`;
      const file = bucket.file(fileName);

      await file.save(JSON.stringify(backupData, null, 2), {
        contentType: 'application/json',
        metadata: {
          createdAt: new Date().toISOString(),
          backupName,
          collections: collections.join(','),
        },
      });

      // Create backup metadata
      const metadataFile = bucket.file(`${backupName}/metadata.json`);
      await metadataFile.save(
        JSON.stringify({
          backupName,
          timestamp: new Date().toISOString(),
          collections: Object.keys(backupData),
          recordCounts: Object.entries(backupData).reduce(
            (acc, [key, value]) => {
              acc[key] = value.length;
              return acc;
            },
            {} as Record<string, number>
          ),
        }),
        {
          contentType: 'application/json',
        }
      );

      // Log audit entry
      await firestore.collection('admin_audit_logs').add({
        userId: 'system',
        action: 'automated_backup',
        resourceType: 'backup',
        resourceId: backupName,
        details: {
          bucket: bucketName,
          fileName,
          collections: Object.keys(backupData),
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Backup completed: ${backupName}`);
      return { success: true, backupName };
    } catch (error: any) {
      console.error('Backup failed:', error);
      throw error;
    }
  });

