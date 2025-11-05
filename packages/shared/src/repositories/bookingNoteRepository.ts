import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirestoreInstance } from '../config/firebase';
import { BookingNote } from '../models/bookingNote';

export class BookingNoteRepository {
  private firestore = getFirestoreInstance();

  /**
   * Create a booking note (subcollection)
   */
  async createNote(
    bookingId: string,
    authorId: string,
    authorRole: string,
    content: string
  ): Promise<BookingNote> {
    try {
      const notesRef = collection(this.firestore, `bookings/${bookingId}/notes`);
      const noteData = {
        authorId,
        authorRole,
        content,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(notesRef, noteData);

      return {
        id: docRef.id,
        bookingId,
        authorId,
        authorRole,
        content,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    } catch (error: any) {
      throw new Error(`Failed to create booking note: ${error.message}`);
    }
  }

  /**
   * Get notes for a booking
   */
  async getNotes(bookingId: string): Promise<BookingNote[]> {
    try {
      const notesRef = collection(this.firestore, `bookings/${bookingId}/notes`);
      const q = query(notesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        bookingId,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || doc.data().createdAt || Date.now(),
        updatedAt: doc.data().updatedAt?.toMillis() || doc.data().updatedAt || Date.now(),
      } as BookingNote));
    } catch (error: any) {
      throw new Error(`Failed to get booking notes: ${error.message}`);
    }
  }
}

// Export singleton instance
export const bookingNoteRepository = new BookingNoteRepository();

