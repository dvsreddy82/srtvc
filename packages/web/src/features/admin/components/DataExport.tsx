import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  TextField,
  Link,
} from '@mui/material';
import { Download, CloudDownload } from '@mui/icons-material';
import { exportService } from '@pet-management/shared';
import type { AppDispatch, RootState } from '../../../store/store';

const COLLECTIONS = [
  'users',
  'pets',
  'medical_records',
  'vaccines',
  'kennels',
  'kennel_runs',
  'bookings',
  'stay_updates',
  'invoices',
  'reviews',
  'pet_consents',
  'staff_assignments',
  'admin_audit_logs',
];

export const DataExport: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [collectionName, setCollectionName] = useState('');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{
    downloadUrl?: string;
    fileName?: string;
    count: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!collectionName) {
      setError('Please select a collection');
      return;
    }

    setExporting(true);
    setError(null);
    setExportResult(null);

    try {
      const result = await exportService.exportData({
        collectionName,
        format,
      });

      setExportResult({
        downloadUrl: result.downloadUrl,
        fileName: result.fileName,
        count: result.count,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Data Export
      </Typography>

      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Collection</InputLabel>
            <Select
              value={collectionName}
              label="Collection"
              onChange={(e) => setCollectionName(e.target.value)}
            >
              {COLLECTIONS.map((col) => (
                <MenuItem key={col} value={col}>
                  {col}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Format</InputLabel>
            <Select value={format} label="Format" onChange={(e) => setFormat(e.target.value as 'csv' | 'json')}>
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
            </Select>
          </FormControl>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {exportResult && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Export completed! {exportResult.count} records exported.
              {exportResult.downloadUrl && (
                <Box sx={{ mt: 1 }}>
                  <Link href={exportResult.downloadUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outlined" startIcon={<CloudDownload />} size="small">
                      Download {exportResult.fileName}
                    </Button>
                  </Link>
                </Box>
              )}
            </Alert>
          )}

          <Button
            variant="contained"
            startIcon={exporting ? <CircularProgress size={20} /> : <Download />}
            onClick={handleExport}
            disabled={exporting || !collectionName}
            fullWidth
            sx={{ mt: 2 }}
          >
            {exporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

