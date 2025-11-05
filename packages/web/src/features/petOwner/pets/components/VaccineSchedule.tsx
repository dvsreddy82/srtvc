import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Warning, Schedule, CheckCircle } from '@mui/icons-material';
import { loadVaccineSchedule, clearError } from '../../../../store/slices/vaccineSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import { format } from 'date-fns';
import type { Pet } from '@pet-management/shared';

interface VaccineScheduleProps {
  pet: Pet;
}

export const VaccineSchedule: React.FC<VaccineScheduleProps> = ({ pet }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { schedules, loading, error } = useSelector((state: RootState) => state.vaccines);
  const schedule = schedules[pet.id];

  useEffect(() => {
    if (pet && !schedule) {
      dispatch(loadVaccineSchedule(pet));
    }
  }, [dispatch, pet, schedule]);

  if (loading && !schedule) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 2 }}>
        <Alert severity="error" onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!schedule || schedule.vaccines.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          padding: 3,
          border: '2px dashed #ccc',
          borderRadius: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No vaccine schedule available
        </Typography>
      </Box>
    );
  }

  const overdueCount = schedule.vaccines.filter((v) => v.isOverdue).length;
  const dueSoonCount = schedule.vaccines.filter((v) => v.isDueSoon && !v.isOverdue).length;

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Vaccine Schedule</Typography>
        {overdueCount > 0 && (
          <Chip
            icon={<Warning />}
            label={`${overdueCount} Overdue`}
            color="error"
            size="small"
          />
        )}
        {dueSoonCount > 0 && (
          <Chip
            icon={<Schedule />}
            label={`${dueSoonCount} Due Soon`}
            color="warning"
            size="small"
          />
        )}
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vaccine Type</TableCell>
              <TableCell>Last Administered</TableCell>
              <TableCell>Next Due Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.vaccines.map((vaccine, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {vaccine.vaccineType}
                  </Typography>
                </TableCell>
                <TableCell>
                  {vaccine.lastAdministeredDate ? (
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(vaccine.lastAdministeredDate), 'MMM dd, yyyy')}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Never
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {vaccine.nextDueDate ? (
                    <Typography variant="body2">
                      {format(new Date(vaccine.nextDueDate), 'MMM dd, yyyy')}
                      {vaccine.daysUntilDue !== null && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {vaccine.daysUntilDue < 0
                            ? `${Math.abs(vaccine.daysUntilDue)} days overdue`
                            : vaccine.daysUntilDue === 0
                            ? 'Due today'
                            : `${vaccine.daysUntilDue} days remaining`}
                        </Typography>
                      )}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Not scheduled
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {vaccine.isOverdue ? (
                    <Chip
                      icon={<Warning />}
                      label="Overdue"
                      color="error"
                      size="small"
                    />
                  ) : vaccine.isDueSoon ? (
                    <Chip
                      icon={<Schedule />}
                      label="Due Soon"
                      color="warning"
                      size="small"
                    />
                  ) : (
                    <Chip
                      icon={<CheckCircle />}
                      label="Upcoming"
                      color="success"
                      size="small"
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

