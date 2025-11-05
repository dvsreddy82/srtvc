import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Button, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { loadActiveBookings } from '../../../store/slices/staffSlice';
import type { AppDispatch, RootState } from '../../../store/store';
import { format } from 'date-fns';

const ActiveBookingsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { activeBookings, loading } = useSelector((state: RootState) => state.staff);
  const [kennelId] = React.useState('kennel123'); // TODO: Get from user profile

  useEffect(() => {
    dispatch(loadActiveBookings(kennelId));
  }, [dispatch, kennelId]);

  const renderBooking = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">{item.petId}</Text>
        <Text variant="bodyMedium" style={styles.date}>
          Check-in: {format(new Date(item.startDate), 'MMM dd, yyyy')}
        </Text>
        <Button mode="contained" style={styles.button}>
          Upload Update
        </Button>
        <Button mode="outlined" style={styles.button}>
          Check Out
        </Button>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={activeBookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge">No active bookings</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  date: {
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    marginTop: 64,
  },
});

export default ActiveBookingsScreen;

