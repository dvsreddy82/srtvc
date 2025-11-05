import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, Text, FAB, Avatar, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { loadPets } from '../../../../store/slices/petSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import type { Pet } from '@pet-management/shared';

const PetsListScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { pets, loading } = useSelector((state: RootState) => state.pets);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(loadPets(user.uid));
    }
  }, [dispatch, user]);

  const renderPetCard = ({ item }: { item: Pet }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('PetDetails' as never, { petId: item.id } as never)}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          {item.photoURL ? (
            <Avatar.Image size={64} source={{ uri: item.photoURL }} />
          ) : (
            <Avatar.Icon size={64} icon="paw" />
          )}
          <View style={styles.petInfo}>
            <Text variant="titleMedium">{item.name}</Text>
            <Text variant="bodyMedium" style={styles.species}>
              {item.species} • {item.breed}
            </Text>
            {item.weight && (
              <Text variant="bodySmall" style={styles.details}>
                {item.weight} lbs
              </Text>
            )}
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </Card.Content>
      </Card>
    </TouchableOpacity>
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
        data={pets}
        renderItem={renderPetCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No pets registered yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Tap the + button to add your first pet
            </Text>
          </View>
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddPet' as never)}
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  petInfo: {
    flex: 1,
    marginLeft: 16,
  },
  species: {
    color: '#666',
    marginTop: 4,
  },
  details: {
    color: '#999',
    marginTop: 4,
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
  emptyText: {
    marginBottom: 8,
    color: '#666',
  },
  emptySubtext: {
    color: '#999',
  },
});

export default PetsListScreen;

