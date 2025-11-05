import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import {
  Card,
  Text,
  TextInput,
  Button,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { searchKennels } from '../../../../store/slices/kennelSlice';
import type { AppDispatch, RootState } from '../../../../store/store';

const KennelSearchScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { searchResults, loading } = useSelector((state: RootState) => state.kennels);
  const { pets } = useSelector((state: RootState) => state.pets);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [petId, setPetId] = useState('');

  const handleSearch = () => {
    if (!startDate || !endDate) {
      return;
    }

    dispatch(
      searchKennels({
        startDate: new Date(startDate).getTime(),
        endDate: new Date(endDate).getTime(),
      })
    );
  };

  const renderKennel = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">{item.kennel.name}</Text>
        <Text variant="bodyMedium" style={styles.address}>
          {item.kennel.address}
        </Text>
        <Text variant="bodyLarge" style={styles.price}>
          ${item.totalPrice.toFixed(2)} total
        </Text>
        <Text variant="bodySmall" style={styles.runs}>
          {item.availableRuns.length} runs available
        </Text>
        <Button mode="contained" style={styles.bookButton}>
          Book Now
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.searchCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Search Kennels
          </Text>

          <TextInput
            label="Check-in Date"
            value={startDate}
            onChangeText={setStartDate}
            mode="outlined"
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />

          <TextInput
            label="Check-out Date"
            value={endDate}
            onChangeText={setEndDate}
            mode="outlined"
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleSearch}
            loading={loading}
            style={styles.searchButton}
          >
            Search
          </Button>
        </Card.Content>
      </Card>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderKennel}
          keyExtractor={(item) => item.kennel.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text variant="bodyLarge">No kennels found</Text>
            </View>
          }
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchCard: {
    margin: 16,
    elevation: 2,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  searchButton: {
    marginTop: 8,
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  address: {
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
  },
  price: {
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 4,
  },
  runs: {
    color: '#666',
    marginBottom: 16,
  },
  bookButton: {
    marginTop: 8,
  },
  loader: {
    marginTop: 32,
  },
  empty: {
    alignItems: 'center',
    marginTop: 32,
    padding: 16,
  },
});

export default KennelSearchScreen;

