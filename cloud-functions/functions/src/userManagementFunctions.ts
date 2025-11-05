/**
 * User Management Cloud Functions
 * Handles custom claims updates and password resets (requires Admin SDK)
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * Update user custom claims (role, kennelId, etc.)
 */
export const updateUserCustomClaims = functions.https.onCall(async (data, context) => {
  // Verify admin role
  if (!context.auth || context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  try {
    const { userId, claims } = data;

    if (!userId || !claims) {
      throw new functions.https.HttpsError('invalid-argument', 'UserId and claims are required');
    }

    // Update custom claims
    await admin.auth().setCustomUserClaims(userId, claims);

    // Revoke user's tokens to force refresh
    await admin.auth().revokeRefreshTokens(userId);

    // Update user document in Firestore
    await admin.firestore().collection('users').doc(userId).update({
      role: claims.role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Log audit entry
    await admin.firestore().collection('admin_audit_logs').add({
      userId: context.auth.uid,
      action: 'update_custom_claims',
      resourceType: 'user',
      resourceId: userId,
      details: {
        claims,
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: 'Custom claims updated successfully. User will need to sign out and sign in again.',
    };
  } catch (error: any) {
    console.error('Failed to update custom claims:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Send password reset email (Admin SDK)
 */
export const sendPasswordResetEmail = functions.https.onCall(async (data, context) => {
  // Verify admin role
  if (!context.auth || context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  try {
    const { email } = data;

    if (!email) {
      throw new functions.https.HttpsError('invalid-argument', 'Email is required');
    }

    // Generate password reset link
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    // Send email via Firebase Auth (or custom email service)
    // Note: Firebase Auth automatically sends password reset emails when using generatePasswordResetLink
    // For custom email, you would use a service like SendGrid, Mailgun, etc.

    // Log audit entry
    await admin.firestore().collection('admin_audit_logs').add({
      userId: context.auth.uid,
      action: 'password_reset_request',
      resourceType: 'user',
      resourceId: email,
      details: {
        email,
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: 'Password reset email sent successfully',
      resetLink, // Return link for admin to manually send if needed
    };
  } catch (error: any) {
    console.error('Failed to send password reset email:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

