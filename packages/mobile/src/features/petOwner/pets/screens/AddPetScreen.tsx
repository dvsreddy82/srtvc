import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  SegmentedButtons,
  ActivityIndicator,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { createPet } from '../../../../store/slices/petSlice';
import { imageService } from '../../../../services/imageService';
import type { AppDispatch, RootState } from '../../../../store/store';

const AddPetScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { saving, error } = useSelector((state: RootState) => state.pets);
  const { user } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [photo, setPhoto] = useState<any>(null);

  const handleImagePicker = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (response.assets && response.assets[0]) {
          setPhoto(response.assets[0]);
        }
      }
    );
  };

  const handleSubmit = async () => {
    if (!name || !species || !breed) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      let photoURL: string | undefined;
      
      // Upload photo if provided
      if (photo) {
        photoURL = await imageService.uploadPetPhoto(photo, user.uid, 'temp');
      }

      await dispatch(
        createPet({
          pet: {
            name,
            species: species as 'dog' | 'cat' | 'bird' | 'rabbit' | 'other',
            breed,
            weight: weight ? parseFloat(weight) : undefined,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth).getTime() : undefined,
            photoURL,
          },
          photoFile: photo,
          userId: user.uid,
        })
      ).unwrap();

      Alert.alert('Success', 'Pet added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add pet');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Add New Pet
          </Text>

          <TextInput
            label="Pet Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <Text variant="labelLarge" style={styles.sectionTitle}>
            Species *
          </Text>
          <SegmentedButtons
            value={species}
            onValueChange={setSpecies}
            buttons={[
              { value: 'dog', label: 'Dog' },
              { value: 'cat', label: 'Cat' },
              { value: 'bird', label: 'Bird' },
              { value: 'rabbit', label: 'Rabbit' },
            ]}
            style={styles.segmentedButtons}
          />

          <TextInput
            label="Breed *"
            value={breed}
            onChangeText={setBreed}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Weight (lbs)"
            value={weight}
            onChangeText={setWeight}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Date of Birth"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            mode="outlined"
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />

          <Button
            mode="outlined"
            onPress={handleImagePicker}
            icon="camera"
            style={styles.imageButton}
          >
            {photo ? 'Change Photo' : 'Add Photo'}
          </Button>

          {photo && (
            <Text variant="bodySmall" style={styles.photoText}>
              Photo selected: {photo.fileName || 'Image'}
            </Text>
          )}

          {error && (
            <Text variant="bodySmall" style={styles.error}>
              {error}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={saving}
            disabled={saving}
            style={styles.submitButton}
          >
            Add Pet
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
    elevation: 4,
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  imageButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  photoText: {
    marginBottom: 16,
    color: '#666',
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  error: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default AddPetScreen;

