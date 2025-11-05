/**
 * Veterinarian Webhook
 * Secure Cloud Function endpoint for clinics to send vaccination records
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

admin.initializeApp();

interface WebhookPayload {
  petId: string;
  ownerId: string;
  vaccineType: string;
  administeredDate: string; // ISO date string
  nextDueDate: string; // ISO date string
  veterinarianId: string;
  clinicId: string;
  clinicName: string;
  batchNumber?: string;
  notes?: string;
}

export const veterinarianWebhook = functions.https.onRequest(async (req, res) => {
  // CORS handling
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-Signature');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // 1. Verify API key
    const apiKey = req.headers['x-api-key'] as string;
    const expectedApiKey = functions.config().veterinarian?.api_key;

    if (!apiKey || apiKey !== expectedApiKey) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    // 2. Verify HMAC signature (optional but recommended)
    const signature = req.headers['x-signature'] as string;
    if (signature) {
      const secret = functions.config().veterinarian?.webhook_secret;
      if (secret) {
        const payload = JSON.stringify(req.body);
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(payload);
        const expectedSignature = hmac.digest('hex');

        if (signature !== expectedSignature) {
          res.status(401).json({ error: 'Invalid signature' });
          return;
        }
      }
    }

    // 3. Validate payload
    const payload: WebhookPayload = req.body;
    
    if (!payload.petId || !payload.ownerId || !payload.vaccineType || !payload.administeredDate) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // 4. Verify pet owner consent
    const consentsRef = admin.firestore().collection('pet_consents');
    const consentQuery = await consentsRef
      .where('petId', '==', payload.petId)
      .where('clinicId', '==', payload.clinicId)
      .where('granted', '==', true)
      .get();

    if (consentQuery.empty) {
      res.status(403).json({ error: 'Pet owner consent required' });
      return;
    }

    // 5. Create medical record
    const medicalRecordsRef = admin.firestore().collection('medical_records');
    const medicalRecord = {
      petId: payload.petId,
      petOwnerId: payload.ownerId,
      recordType: 'vaccination',
      date: admin.firestore.Timestamp.fromDate(new Date(payload.administeredDate)),
      veterinarianId: payload.veterinarianId,
      clinicId: payload.clinicId,
      clinicName: payload.clinicName,
      notes: payload.notes || `Vaccination: ${payload.vaccineType}`,
      documents: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const recordDoc = await medicalRecordsRef.add(medicalRecord);

    // 6. Create vaccine record
    const vaccinesRef = admin.firestore().collection('vaccines');
    const vaccine = {
      petId: payload.petId,
      type: payload.vaccineType,
      administeredDate: admin.firestore.Timestamp.fromDate(new Date(payload.administeredDate)),
      nextDueDate: admin.firestore.Timestamp.fromDate(new Date(payload.nextDueDate)),
      veterinarianId: payload.veterinarianId,
      batchNumber: payload.batchNumber,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await vaccinesRef.add(vaccine);

    // 7. Send FCM notification to pet owner
    const userDoc = await admin.firestore().doc(`users/${payload.ownerId}`).get();
    const userData = userDoc.data();
    
    if (userData?.fcmToken) {
      const messaging = admin.messaging();
      await messaging.send({
        token: userData.fcmToken,
        notification: {
          title: 'New Vaccination Record',
          body: `${payload.vaccineType} vaccination record has been added for your pet.`,
        },
        data: {
          type: 'vaccination_record',
          petId: payload.petId,
          recordId: recordDoc.id,
        },
      });
    }

    // 8. Log audit entry
    await admin.firestore().collection('admin_audit_logs').add({
      userId: payload.veterinarianId,
      action: 'webhook_vaccination_record',
      resourceType: 'medical_record',
      resourceId: recordDoc.id,
      details: {
        petId: payload.petId,
        clinicId: payload.clinicId,
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 9. Return success response
    res.status(200).json({
      success: true,
      recordId: recordDoc.id,
      message: 'Vaccination record created successfully',
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

