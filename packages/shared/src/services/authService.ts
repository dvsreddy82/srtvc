import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  Auth,
} from 'firebase/auth';
import { getAuthInstance } from '../config/firebase';
import { User, UserProfile } from '../models/user';

export interface SignupData {
  email: string;
  password: string;
  displayName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  private auth: Auth;

  constructor() {
    this.auth = getAuthInstance();
  }

  /**
   * Sign up a new user with email and password
   */
  async signup(data: SignupData): Promise<FirebaseUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // Update display name if provided
      if (data.displayName) {
        await updateProfile(user, { displayName: data.displayName });
      }

      // Send email verification
      await sendEmailVerification(user);

      return user;
    } catch (error: any) {
      throw new Error(`Signup failed: ${error.message}`);
    }
  }

  /**
   * Sign in with email and password
   */
  async login(data: LoginData): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        data.email,
        data.password
      );
      return userCredential.user;
    } catch (error: any) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error: any) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, callback);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  /**
   * Get user ID token (JWT)
   */
  async getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  }
}

// Export singleton instance
export const authService = new AuthService();

