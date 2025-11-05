/**
 * Desktop File Service
 * Handles file operations using Electron's file system APIs
 */

import { app, dialog } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import { DOCUMENTS_DIR, INVOICES_DIR, MEDICAL_RECORDS_DIR } from '../utils/constants';

export class DesktopFileService {
  private documentsPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.documentsPath = path.join(userDataPath, DOCUMENTS_DIR);
    this.ensureDirectoryExists();
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.mkdir(this.documentsPath, { recursive: true });
    } catch (error) {
      console.error('Failed to create documents directory:', error);
    }
  }

  /**
   * Save invoice PDF to local file system
   */
  async saveInvoicePDF(invoiceId: string, pdfBuffer: Buffer): Promise<string> {
    try {
      const fileName = `invoice_${invoiceId}.pdf`;
      const invoicesDir = path.join(this.documentsPath, INVOICES_DIR);
      const filePath = path.join(invoicesDir, fileName);
      
      // Ensure invoices directory exists
      await fs.mkdir(invoicesDir, { recursive: true });
      
      await fs.writeFile(filePath, pdfBuffer);
      return filePath;
    } catch (error: any) {
      throw new Error(`Failed to save invoice PDF: ${error.message}`);
    }
  }

  /**
   * Get invoice PDF path
   */
  async getInvoicePDFPath(invoiceId: string): Promise<string | null> {
    try {
      const fileName = `invoice_${invoiceId}.pdf`;
      const filePath = path.join(this.documentsPath, INVOICES_DIR, fileName);
      
      await fs.access(filePath);
      return filePath;
    } catch {
      return null;
    }
  }

  /**
   * Save medical record document
   */
  async saveMedicalDocument(
    recordId: string,
    documentBuffer: Buffer,
    extension: string = 'pdf'
  ): Promise<string> {
    try {
      const fileName = `medical_record_${recordId}.${extension}`;
      const medicalDir = path.join(this.documentsPath, MEDICAL_RECORDS_DIR);
      const filePath = path.join(medicalDir, fileName);
      
      await fs.mkdir(medicalDir, { recursive: true });
      await fs.writeFile(filePath, documentBuffer);
      return filePath;
    } catch (error: any) {
      throw new Error(`Failed to save medical document: ${error.message}`);
    }
  }

  /**
   * Show file picker dialog
   */
  async showFilePicker(
    title: string,
    filters: { name: string; extensions: string[] }[]
  ): Promise<string | null> {
    const result = await dialog.showOpenDialog({
      title,
      filters,
      properties: ['openFile'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  }

  /**
   * Show save file dialog
   */
  async showSaveDialog(
    title: string,
    defaultPath: string,
    filters: { name: string; extensions: string[] }[]
  ): Promise<string | null> {
    const result = await dialog.showSaveDialog({
      title,
      defaultPath,
      filters,
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    return result.filePath;
  }

  /**
   * Read file as buffer
   */
  async readFile(filePath: string): Promise<Buffer> {
    return await fs.readFile(filePath);
  }

  /**
   * Write file
   */
  async writeFile(filePath: string, data: Buffer | string): Promise<void> {
    await fs.writeFile(filePath, data);
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

export const fileService = new DesktopFileService();

