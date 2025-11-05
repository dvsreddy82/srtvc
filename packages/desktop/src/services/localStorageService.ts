/**
 * Desktop Local Storage Service
 * Uses better-sqlite3 for Electron
 */

import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';

export class DesktopLocalStorageService {
  private db: Database.Database | null = null;
  private dbPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'pet-management.db');
  }

  async init(): Promise<void> {
    try {
      this.db = new Database(this.dbPath);
      this.createTables();
    } catch (error) {
      console.error('Failed to initialize SQLite:', error);
      throw error;
    }
  }

  private createTables(): void {
    if (!this.db) return;

    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS pets (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS medical_records (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS vaccines (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS kennels (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS kennel_runs (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS stay_updates (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `;

    this.db.exec(createTablesSQL);
  }

  async saveUser(user: any): Promise<void> {
    await this.saveItem('users', user.id, user);
  }

  async getUser(userId: string): Promise<any | null> {
    return await this.getItem('users', userId);
  }

  async savePet(pet: any): Promise<void> {
    await this.saveItem('pets', pet.id, pet);
  }

  async getPet(petId: string): Promise<any | null> {
    return await this.getItem('pets', petId);
  }

  async getPets(ownerId?: string): Promise<any[]> {
    const pets = await this.getAllItems('pets');
    if (ownerId) {
      return pets.filter((p: any) => p.ownerId === ownerId);
    }
    return pets;
  }

  async saveBooking(booking: any): Promise<void> {
    await this.saveItem('bookings', booking.id, booking);
  }

  async getBookings(userId?: string): Promise<any[]> {
    const bookings = await this.getAllItems('bookings');
    if (userId) {
      return bookings.filter((b: any) => b.userId === userId);
    }
    return bookings;
  }

  async saveMedicalRecord(record: any): Promise<void> {
    await this.saveItem('medical_records', record.id, record);
  }

  async getMedicalRecords(petId: string): Promise<any[]> {
    const records = await this.getAllItems('medical_records');
    return records.filter((r: any) => r.petId === petId);
  }

  async saveVaccine(vaccine: any): Promise<void> {
    await this.saveItem('vaccines', vaccine.id, vaccine);
  }

  async getVaccines(petId: string): Promise<any[]> {
    const vaccines = await this.getAllItems('vaccines');
    return vaccines.filter((v: any) => v.petId === petId);
  }

  async saveKennel(kennel: any): Promise<void> {
    await this.saveItem('kennels', kennel.id, kennel);
  }

  async getKennels(): Promise<any[]> {
    return await this.getAllItems('kennels');
  }

  async saveKennelRun(run: any): Promise<void> {
    await this.saveItem('kennel_runs', run.id, run);
  }

  async getKennelRuns(kennelId?: string): Promise<any[]> {
    const runs = await this.getAllItems('kennel_runs');
    if (kennelId) {
      return runs.filter((r: any) => r.kennelId === kennelId);
    }
    return runs;
  }

  async saveStayUpdate(update: any): Promise<void> {
    await this.saveItem('stay_updates', update.id, update);
  }

  async getStayUpdates(bookingId: string): Promise<any[]> {
    const updates = await this.getAllItems('stay_updates');
    return updates.filter((u: any) => u.bookingId === bookingId);
  }

  async saveInvoice(invoice: any): Promise<void> {
    await this.saveItem('invoices', invoice.id, invoice);
  }

  async getInvoices(userId: string): Promise<any[]> {
    const invoices = await this.getAllItems('invoices');
    return invoices.filter((i: any) => i.userId === userId);
  }

  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) return;
    const stmt = this.db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    stmt.run(key, JSON.stringify(value));
  }

  async getSetting(key: string): Promise<any> {
    if (!this.db) return null;
    const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
    const row = stmt.get(key) as any;
    return row ? JSON.parse(row.value) : null;
  }

  private async saveItem(table: string, id: string, data: any): Promise<void> {
    if (!this.db) return;
    const stmt = this.db.prepare(`INSERT OR REPLACE INTO ${table} (id, data) VALUES (?, ?)`);
    stmt.run(id, JSON.stringify(data));
  }

  private async getItem(table: string, id: string): Promise<any | null> {
    if (!this.db) return null;
    const stmt = this.db.prepare(`SELECT data FROM ${table} WHERE id = ?`);
    const row = stmt.get(id) as any;
    return row ? JSON.parse(row.data) : null;
  }

  private async getAllItems(table: string): Promise<any[]> {
    if (!this.db) return [];
    const stmt = this.db.prepare(`SELECT data FROM ${table}`);
    const rows = stmt.all() as any[];
    return rows.map((row) => JSON.parse(row.data));
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const localStorageService = new DesktopLocalStorageService();

