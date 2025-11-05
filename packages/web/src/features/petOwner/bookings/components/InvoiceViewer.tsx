import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack, Download } from '@mui/icons-material';
import { loadInvoicePDF, setCurrentInvoice, clearError, loadInvoices } from '../../../../store/slices/invoiceSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import { format } from 'date-fns';
import type { Invoice } from '@pet-management/shared';

export const InvoiceViewer: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { invoices, currentInvoiceURL, downloading, error } = useSelector(
    (state: RootState) => state.invoices
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const invoice = invoices.find((inv) => inv.id === invoiceId);

  useEffect(() => {
    if (!invoice && user) {
      // Load invoices if not loaded
      dispatch(loadInvoices(user.uid));
    }
  }, [dispatch, invoice, user]);

  useEffect(() => {
    if (invoice && !currentInvoiceURL) {
      // Load PDF if not already loaded
      dispatch(loadInvoicePDF(invoice));
    }
  }, [dispatch, invoice, currentInvoiceURL]);

  const handleDownload = () => {
    if (currentInvoiceURL && invoice) {
      const link = document.createElement('a');
      link.href = currentInvoiceURL;
      link.download = `${invoice.invoiceNumber}.pdf`;
      link.click();
    }
  };

  if (!invoice) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert severity="info">Invoice not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/invoices')}
        sx={{ mb: 2 }}
      >
        Back to Invoices
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        Invoice {invoice.invoiceNumber}
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Invoice Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Invoice Number
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {invoice.invoiceNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(invoice.createdAt), 'MMMM dd, yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Due Date
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1">
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${invoice.totalAmount.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={downloading ? <CircularProgress size={16} /> : <Download />}
                    onClick={handleDownload}
                    disabled={downloading || !currentInvoiceURL}
                  >
                    {downloading ? 'Loading...' : 'Download PDF'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, minHeight: 600 }}>
            {downloading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 600 }}>
                <CircularProgress />
              </Box>
            ) : currentInvoiceURL ? (
              <iframe
                src={currentInvoiceURL}
                style={{
                  width: '100%',
                  height: '600px',
                  border: 'none',
                }}
                title="Invoice PDF"
              />
            ) : (
              <Box sx={{ textAlign: 'center', padding: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Loading invoice PDF...
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

