import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
// Note: DatePicker requires @mui/x-date-pickers package
// For now, using basic TextField with type="date"
import { generateBookingReport, clearError } from '../../../store/slices/reportsSlice';
import type { AppDispatch, RootState } from '../../../store/store';
import { format } from 'date-fns';
import type { ReportFilters } from '@pet-management/shared';

export const ReportsDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { kennels } = useSelector((state: RootState) => state.kennels);
  const { bookingReport, loading, error } = useSelector((state: RootState) => state.reports);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date().setMonth(new Date().getMonth() - 1).valueOf(),
    endDate: Date.now(),
  });

  const handleGenerateReport = () => {
    dispatch(generateBookingReport(filters));
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Reports Dashboard
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Report Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Kennel (Optional)</InputLabel>
                <Select
                  value={filters.kennelId || ''}
                  label="Kennel (Optional)"
                  onChange={(e) => setFilters({ ...filters, kennelId: e.target.value || undefined })}
                >
                  <MenuItem value="">All Kennels</MenuItem>
                  {kennels.map((kennel) => (
                    <MenuItem key={kennel.id} value={kennel.id}>
                      {kennel.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={format(new Date(filters.startDate), 'yyyy-MM-dd')}
                onChange={(e) => setFilters({ ...filters, startDate: new Date(e.target.value).getTime() })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={format(new Date(filters.endDate), 'yyyy-MM-dd')}
                onChange={(e) => setFilters({ ...filters, endDate: new Date(e.target.value).getTime() })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleGenerateReport}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Generate Report'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {bookingReport && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Booking Statistics
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Total Bookings</TableCell>
                        <TableCell align="right">{bookingReport.totalBookings}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Confirmed</TableCell>
                        <TableCell align="right">{bookingReport.confirmedBookings}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Checked In</TableCell>
                        <TableCell align="right">{bookingReport.checkedInBookings}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Checked Out</TableCell>
                        <TableCell align="right">{bookingReport.checkedOutBookings}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Cancelled</TableCell>
                        <TableCell align="right">{bookingReport.cancelledBookings}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Revenue Statistics
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" color="primary">
                    ${bookingReport.totalRevenue.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Average Booking Value
                  </Typography>
                  <Typography variant="h6">
                    ${bookingReport.averageBookingValue.toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

