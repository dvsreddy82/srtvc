import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Avatar, Chip, Divider, Button } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { RootState } from '../../../../store/store';
import { format } from 'date-fns';

const PetDetailsScreen: React.FC = () => {
  const route = useRoute();
  const { petId } = (route.params as any) || {};
  const { pets } = useSelector((state: RootState) => state.pets);
  const pet = pets.find((p) => p.id === petId);

  if (!pet) {
    return (
      <View style={styles.center}>
        <Text>Pet not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.header}>
          {pet.photoURL ? (
            <Avatar.Image size={100} source={{ uri: pet.photoURL }} />
          ) : (
            <Avatar.Icon size={100} icon="paw" />
          )}
          <Text variant="headlineMedium" style={styles.name}>
            {pet.name}
          </Text>
          <Chip icon="paw">{pet.species}</Chip>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Information
          </Text>
          <Divider style={styles.divider} />
          
          <View style={styles.row}>
            <Text variant="bodyMedium" style={styles.label}>Breed:</Text>
            <Text variant="bodyMedium">{pet.breed}</Text>
          </View>
          
          {pet.weight && (
            <View style={styles.row}>
              <Text variant="bodyMedium" style={styles.label}>Weight:</Text>
              <Text variant="bodyMedium">{pet.weight} lbs</Text>
            </View>
          )}
          
          {pet.dateOfBirth && (
            <View style={styles.row}>
              <Text variant="bodyMedium" style={styles.label}>Date of Birth:</Text>
              <Text variant="bodyMedium">
                {format(new Date(pet.dateOfBirth), 'MMM dd, yyyy')}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Medical Records
          </Text>
          <Divider style={styles.divider} />
          <Button mode="outlined" icon="file-document" style={styles.button}>
            View Medical Records
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Vaccine Schedule
          </Text>
          <Divider style={styles.divider} />
          <Button mode="outlined" icon="needle" style={styles.button}>
            View Vaccine Schedule
          </Button>
        </Card.Content>
      </Card>
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
    marginBottom: 8,
    elevation: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  name: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
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
  button: {
    marginTop: 8,
  },
});

export default PetDetailsScreen;

