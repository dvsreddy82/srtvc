import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, TextInput, Button } from 'react-native-paper';

const MedicalHistoryViewerScreen: React.FC = () => {
  const [petId, setPetId] = React.useState('');

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall">Medical History Viewer</Text>
          <TextInput
            label="Pet ID"
            value={petId}
            onChangeText={setPetId}
            mode="outlined"
            style={styles.input}
          />
          <Button mode="contained" style={styles.button}>
            Search
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
    elevation: 2,
  },
  input: {
    marginTop: 16,
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default MedicalHistoryViewerScreen;

