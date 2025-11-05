import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const onBookingCreate = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snapshot, context) => {
    const booking = snapshot.data();
    const bookingId = context.params.bookingId;

    try {
      // Note: Availability is already updated in the transaction during booking creation
      // This function handles notifications and other post-creation tasks

      // Get pet and user information
      const petDoc = await admin.firestore().doc(`pets/${booking.petId}`).get();
      const userDoc = await admin.firestore().doc(`users/${booking.userId}`).get();
      const kennelDoc = await admin.firestore().doc(`kennels/${booking.kennelId}`).get();

      const petName = petDoc.exists ? petDoc.data()?.name : 'Your pet';
      const userName = userDoc.exists ? userDoc.data()?.displayName || userDoc.data()?.email : 'Customer';
      const kennelName = kennelDoc.exists ? kennelDoc.data()?.name : 'Kennel';

      // Send FCM notification to pet owner
      const userData = userDoc.data();
      if (userData?.fcmToken) {
        const messaging = admin.messaging();
        await messaging.send({
          token: userData.fcmToken,
          notification: {
            title: 'Booking Created',
            body: `Your booking for ${petName} at ${kennelName} has been created. Status: ${booking.status}`,
          },
          data: {
            type: 'booking_created',
            bookingId,
            status: booking.status,
          },
        });
      }

      // Send FCM notification to staff (if staff tokens are stored)
      // TODO: Implement staff notification based on kennel assignments

      // Send email notification via Resend (if configured)
      // TODO: Implement email notification
      // const emailService = require('./services/emailService');
      // await emailService.sendBookingConfirmation(userData.email, booking, petName, kennelName);

      console.log(`Booking ${bookingId} created successfully`);
      return null;
    } catch (error) {
      console.error(`Error processing booking ${bookingId}:`, error);
      // Don't throw - allow booking to be created even if notifications fail
      return null;
    }
  });

// Handle booking status updates (confirmation, check-in, check-out)
export const onBookingUpdate = functions.firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const bookingId = context.params.bookingId;

    // Only process if status changed
    if (before.status === after.status) {
      return null;
    }

    try {
      const userDoc = await admin.firestore().doc(`users/${after.userId}`).get();
      const userData = userDoc.data();

      if (!userData?.fcmToken) {
        return null;
      }

      const messaging = admin.messaging();
      let title = 'Booking Updated';
      let body = '';

      switch (after.status) {
        case 'confirmed':
          title = 'Booking Confirmed!';
          body = `Your booking has been confirmed. We're looking forward to hosting your pet!`;
          break;
        case 'checked-in':
          title = 'Pet Checked In';
          body = `Your pet has been checked in. You'll receive updates during their stay.`;
          break;
        case 'checked-out':
          title = 'Pet Checked Out';
          body = `Your pet has been checked out. Thank you for choosing us!`;
          break;
        case 'cancelled':
          title = 'Booking Cancelled';
          body = `Your booking has been cancelled.`;
          break;
      }

      await messaging.send({
        token: userData.fcmToken,
        notification: {
          title,
          body,
        },
        data: {
          type: 'booking_status_update',
          bookingId,
          status: after.status,
        },
      });

      console.log(`Booking ${bookingId} status updated to ${after.status}`);
      return null;
    } catch (error) {
      console.error(`Error processing booking update ${bookingId}:`, error);
      return null;
    }
  });

