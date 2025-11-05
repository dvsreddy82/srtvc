import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { loadTodayCheckIns } from '../../../store/slices/staffSlice';
import type { AppDispatch, RootState } from '../../../store/store';
import { format } from 'date-fns';

const TodayCheckInsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { todayCheckIns, loading } = useSelector((state: RootState) => state.staff);
  const [kennelId] = useState('kennel123'); // TODO: Get from user profile

  useEffect(() => {
    dispatch(loadTodayCheckIns(kennelId));
  }, [dispatch, kennelId]);

  const renderCheckIn = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium">Pet Name</Text>
          <Chip>{item.status}</Chip>
        </View>
        <Text variant="bodyMedium" style={styles.time}>
          Check-in: {format(new Date(item.startDate), 'h:mm a')}
        </Text>
        <Button
          mode="contained"
          style={styles.button}
          disabled={item.status !== 'confirmed' && item.status !== 'pending'}
        >
          Check In
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
        data={todayCheckIns}
        renderItem={renderCheckIn}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge">No check-ins scheduled for today</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  time: {
    color: '#666',
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

export default TodayCheckInsScreen;

