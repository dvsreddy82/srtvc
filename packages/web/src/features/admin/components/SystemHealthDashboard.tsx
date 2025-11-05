import React, { useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { Refresh, CheckCircle, Warning, Error as ErrorIcon } from '@mui/icons-material';
import {
  loadAuditLogs,
  loadSystemMetrics,
  loadSystemHealth,
  clearError,
} from '../../../store/slices/systemMonitoringSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import { format } from 'date-fns';

export const SystemHealthDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { auditLogs, systemMetrics, systemHealth, loading, error } = useSelector(
    (state: RootState) => state.systemMonitoring
  );

  useEffect(() => {
    dispatch(loadSystemHealth());
    dispatch(loadSystemMetrics());
    dispatch(loadAuditLogs(100));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(loadSystemHealth());
    dispatch(loadSystemMetrics());
    dispatch(loadAuditLogs(100));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle color="success" />;
      case 'degraded':
        return <Warning color="warning" />;
      case 'unhealthy':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'unhealthy':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          System Health Dashboard
        </Typography>
        <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh} disabled={loading}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => dispatch(clearError())} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {systemHealth && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {getStatusIcon(systemHealth.status)}
                  <Typography variant="h6">System Status</Typography>
                </Box>
                <Chip
                  label={systemHealth.status.toUpperCase()}
                  color={getStatusColor(systemHealth.status) as any}
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Metrics (Last 24 Hours)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Firestore Reads
                    </Typography>
                    <Typography variant="h6">{systemHealth.metrics.firestoreReads}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Firestore Writes
                    </Typography>
                    <Typography variant="h6">{systemHealth.metrics.firestoreWrites}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Storage Uploads
                    </Typography>
                    <Typography variant="h6">{systemHealth.metrics.storageUploads}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Errors
                    </Typography>
                    <Typography variant="h6" color={systemHealth.metrics.errorCount > 0 ? 'error' : 'text.primary'}>
                      {systemHealth.metrics.errorCount}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Audit Logs
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Resource</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.slice(0, 50).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.timestamp), 'MMM dd, yyyy h:mm a')}
                      </TableCell>
                      <TableCell>{log.userId.substring(0, 8)}</TableCell>
                      <TableCell>
                        <Chip label={log.action} size="small" />
                      </TableCell>
                      <TableCell>
                        {log.resourceType} ({log.resourceId.substring(0, 8)})
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {JSON.stringify(log.details || {})}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

