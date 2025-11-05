import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Chip, ActivityIndicator, FAB } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { loadUserBookings } from '../../../../store/slices/bookingSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import type { Booking } from '@pet-management/shared';
import { format } from 'date-fns';

const BookingsListScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { bookings, loading } = useSelector((state: RootState) => state.bookings);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(loadUserBookings(user.uid));
    }
  }, [dispatch, user]);

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'checked-in':
        return 'info';
      case 'checked-out':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('BookingDetails' as never, { bookingId: item.id } as never)}
    >
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium">Booking #{item.id.substring(0, 8)}</Text>
          <Chip mode="flat" style={styles.chip}>
            {item.status}
          </Chip>
        </View>
        <Text variant="bodyMedium" style={styles.date}>
          {format(new Date(item.startDate), 'MMM dd')} - {format(new Date(item.endDate), 'MMM dd, yyyy')}
        </Text>
        <Text variant="bodyLarge" style={styles.amount}>
          ${item.totalAmount.toFixed(2)}
        </Text>
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
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge">No bookings yet</Text>
          </View>
        }
      />
      <FAB
        icon="magnify"
        style={styles.fab}
        onPress={() => navigation.navigate('Search' as never)}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chip: {
    height: 24,
  },
  date: {
    color: '#666',
    marginBottom: 8,
  },
  amount: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
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

export default BookingsListScreen;

