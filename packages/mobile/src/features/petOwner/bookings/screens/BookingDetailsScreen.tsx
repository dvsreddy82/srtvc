import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Chip, Divider } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/store';
import { format } from 'date-fns';

const BookingDetailsScreen: React.FC = () => {
  const route = useRoute();
  const { bookingId } = (route.params as any) || {};
  const { bookings } = useSelector((state: RootState) => state.bookings);
  const booking = bookings.find((b) => b.id === bookingId);

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text>Booking not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleLarge">Booking #{booking.id.substring(0, 8)}</Text>
            <Chip>{booking.status}</Chip>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.row}>
            <Text variant="bodyMedium" style={styles.label}>Check-in:</Text>
            <Text variant="bodyMedium">{format(new Date(booking.startDate), 'MMM dd, yyyy')}</Text>
          </View>

          <View style={styles.row}>
            <Text variant="bodyMedium" style={styles.label}>Check-out:</Text>
            <Text variant="bodyMedium">{format(new Date(booking.endDate), 'MMM dd, yyyy')}</Text>
          </View>

          <View style={styles.row}>
            <Text variant="bodyMedium" style={styles.label}>Total Amount:</Text>
            <Text variant="titleMedium" style={styles.amount}>
              ${booking.totalAmount.toFixed(2)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text variant="bodyMedium" style={styles.label}>Payment Status:</Text>
            <Chip mode="flat" style={styles.chip}>
              {booking.paymentStatus}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {booking.status === 'checked-in' && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Stay Updates</Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              View daily updates from kennel staff
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  divider: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    color: '#666',
  },
  amount: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  chip: {
    height: 24,
  },
  emptyText: {
    marginTop: 8,
    color: '#666',
  },
});

export default BookingDetailsScreen;

