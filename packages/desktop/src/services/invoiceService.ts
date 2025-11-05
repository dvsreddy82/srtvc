/**
 * Desktop Invoice Service
 * Handles invoice PDF caching in file system
 * Note: Invoice download is typically done in renderer, this handles file system caching
 */

import { fileService } from './fileService';

export class DesktopInvoiceService {
  /**
   * Save invoice PDF to file system
   */
  async saveInvoicePDF(invoiceId: string, pdfBuffer: Buffer): Promise<string> {
    try {
      // Save to local file system
      const filePath = await fileService.saveInvoicePDF(invoiceId, pdfBuffer);
      return `file://${filePath}`;
    } catch (error: any) {
      throw new Error(`Failed to save invoice PDF: ${error.message}`);
    }
  }

  /**
   * Check if invoice is cached
   */
  async isInvoiceCached(invoiceId: string): Promise<boolean> {
    const path = await fileService.getInvoicePDFPath(invoiceId);
    return path !== null;
  }

  /**
   * Get cached invoice path
   */
  async getCachedInvoicePath(invoiceId: string): Promise<string | null> {
    return await fileService.getInvoicePDFPath(invoiceId);
  }

  /**
   * Open invoice in default PDF viewer
   */
  async openInvoice(invoiceId: string): Promise<void> {
    const { shell } = await import('electron');
    const filePath = await fileService.getInvoicePDFPath(invoiceId);
    if (filePath) {
      await shell.openPath(filePath);
    } else {
      throw new Error('Invoice not found in cache');
    }
  }
}

export const invoiceService = new DesktopInvoiceService();

