import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { invoiceRepository, invoiceService } from '@pet-management/shared';
import type { Invoice } from '@pet-management/shared';

interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  currentInvoiceURL: string | null;
  loading: boolean;
  error: string | null;
  downloading: boolean;
}

const initialState: InvoiceState = {
  invoices: [],
  currentInvoice: null,
  currentInvoiceURL: null,
  loading: false,
  error: null,
  downloading: false,
};

// Async thunks
export const loadInvoices = createAsyncThunk(
  'invoices/loadInvoices',
  async (userId: string, { rejectWithValue }) => {
    try {
      const invoices = await invoiceRepository.getInvoices(userId);
      return invoices;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const syncNewInvoices = createAsyncThunk(
  'invoices/syncNewInvoices',
  async (userId: string, { rejectWithValue }) => {
    try {
      await invoiceRepository.syncNewInvoices(userId);
      const invoices = await invoiceRepository.getInvoices(userId);
      return invoices;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadInvoicePDF = createAsyncThunk(
  'invoices/loadInvoicePDF',
  async (invoice: Invoice, { rejectWithValue }) => {
    try {
      const pdfURL = await invoiceService.downloadAndCacheInvoice(invoice);
      return { invoiceId: invoice.id, pdfURL };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentInvoice: (state, action: PayloadAction<Invoice | null>) => {
      state.currentInvoice = action.payload;
      state.currentInvoiceURL = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load invoices
      .addCase(loadInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(loadInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sync new invoices
      .addCase(syncNewInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncNewInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(syncNewInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load invoice PDF
      .addCase(loadInvoicePDF.pending, (state) => {
        state.downloading = true;
        state.error = null;
      })
      .addCase(loadInvoicePDF.fulfilled, (state, action) => {
        state.downloading = false;
        state.currentInvoiceURL = action.payload.pdfURL;
      })
      .addCase(loadInvoicePDF.rejected, (state, action) => {
        state.downloading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;

