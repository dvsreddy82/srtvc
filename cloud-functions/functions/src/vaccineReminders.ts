import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const vaccineReminders = functions.pubsub
  .schedule('0 9 * * *') // Every day at 9 AM UTC
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      const now = Date.now();
      const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;
      
      // Query vaccines due in next 7 days
      const vaccinesSnapshot = await admin.firestore()
        .collection('vaccines')
        .where('nextDueDate', '>=', admin.firestore.Timestamp.fromMillis(now))
        .where('nextDueDate', '<=', admin.firestore.Timestamp.fromMillis(sevenDaysFromNow))
        .get();

      if (vaccinesSnapshot.empty) {
        console.log('No vaccines due in the next 7 days');
        return null;
      }

      // Group by pet owner
      const remindersByOwner: Record<string, Array<{ petId: string; petName: string; vaccineType: string; dueDate: number }>> = {};

      for (const vaccineDoc of vaccinesSnapshot.docs) {
        const vaccine = vaccineDoc.data();
        
        // Get pet information
        const petDoc = await admin.firestore()
          .collection('pets')
          .doc(vaccine.petId)
          .get();

        if (!petDoc.exists) continue;

        const pet = petDoc.data();
        const ownerId = pet?.ownerId;

        if (!ownerId) continue;

        if (!remindersByOwner[ownerId]) {
          remindersByOwner[ownerId] = [];
        }

        remindersByOwner[ownerId].push({
          petId: vaccine.petId,
          petName: pet?.name || 'Your pet',
          vaccineType: vaccine.type,
          dueDate: vaccine.nextDueDate?.toMillis() || vaccine.nextDueDate,
        });
      }

      // Send batched FCM notifications (max 500 per batch)
      const messaging = admin.messaging();
      const notificationPromises: Promise<any>[] = [];

      for (const [ownerId, reminders] of Object.entries(remindersByOwner)) {
        // Get user's FCM token
        const userDoc = await admin.firestore()
          .collection('users')
          .doc(ownerId)
          .get();

        if (!userDoc.exists) continue;

        const userData = userDoc.data();
        const fcmToken = userData?.fcmToken;

        if (!fcmToken) continue;

        // Create notification message
        const reminderCount = reminders.length;
        const title = reminderCount === 1
          ? `Vaccine due for ${reminders[0].petName}`
          : `${reminderCount} vaccines due soon`;

        const body = reminderCount === 1
          ? `${reminders[0].vaccineType} is due for ${reminders[0].petName}`
          : `Multiple vaccines are due in the next 7 days`;

        const message = {
          token: fcmToken,
          notification: {
            title,
            body,
          },
          data: {
            type: 'vaccine_reminder',
            petIds: JSON.stringify(reminders.map((r) => r.petId)),
          },
        };

        notificationPromises.push(
          messaging.send(message).catch((error) => {
            console.error(`Failed to send notification to ${ownerId}:`, error);
          })
        );
      }

      // Wait for all notifications to be sent
      await Promise.all(notificationPromises);

      console.log(`Vaccine reminders sent to ${Object.keys(remindersByOwner).length} owners`);
      return null;
    } catch (error) {
      console.error('Error sending vaccine reminders:', error);
      throw error;
    }
  });

