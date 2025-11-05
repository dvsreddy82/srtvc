/**
 * Export Data Cloud Function
 * Exports Firestore collections to CSV format
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const firestore = admin.firestore();

interface ExportRequest {
  collectionName: string;
  filters?: Record<string, any>;
  format?: 'csv' | 'json';
}

export const exportData = functions.https.onCall(async (data: ExportRequest, context) => {
  // Verify admin role
  if (!context.auth || context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  try {
    const { collectionName, filters, format = 'csv' } = data;

    if (!collectionName) {
      throw new functions.https.HttpsError('invalid-argument', 'Collection name is required');
    }

    // Get collection data
    let query = firestore.collection(collectionName) as admin.firestore.Query;

    // Apply filters if provided
    if (filters) {
      for (const [field, value] of Object.entries(filters)) {
        query = query.where(field, '==', value);
      }
    }

    const snapshot = await query.get();
    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (format === 'json') {
      return {
        success: true,
        data: docs,
        count: docs.length,
      };
    }

    // Convert to CSV
    if (docs.length === 0) {
      return {
        success: true,
        csv: '',
        count: 0,
      };
    }

    // Get all unique keys from all documents
    const allKeys = new Set<string>();
    docs.forEach((doc) => {
      Object.keys(doc).forEach((key) => allKeys.add(key));
    });

    const headers = Array.from(allKeys);
    const csvRows: string[] = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    docs.forEach((doc) => {
      const row = headers.map((header) => {
        const value = doc[header];
        if (value === null || value === undefined) {
          return '';
        }
        if (typeof value === 'object') {
          return JSON.stringify(value).replace(/"/g, '""');
        }
        return String(value).replace(/"/g, '""').replace(/,/g, ';');
      });
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');

    // Store in Cloud Storage
    const storage = admin.storage();
    const bucket = storage.bucket();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `exports/${collectionName}-${timestamp}.csv`;
    const file = bucket.file(fileName);

    await file.save(csv, {
      contentType: 'text/csv',
      metadata: {
        collectionName,
        exportedAt: new Date().toISOString(),
        exportedBy: context.auth.uid,
      },
    });

    // Get signed URL (valid for 1 hour)
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    // Log audit entry
    await firestore.collection('admin_audit_logs').add({
      userId: context.auth.uid,
      action: 'export_data',
      resourceType: 'export',
      resourceId: fileName,
      details: {
        collectionName,
        format,
        count: docs.length,
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      csv,
      downloadUrl: signedUrl,
      fileName,
      count: docs.length,
    };
  } catch (error: any) {
    console.error('Export failed:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

