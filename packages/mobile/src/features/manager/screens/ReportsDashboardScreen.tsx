import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';

const ReportsDashboardScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall">Reports Dashboard</Text>
          <Text variant="bodyMedium" style={styles.description}>
            View booking statistics, revenue reports, and occupancy metrics
          </Text>
          <Button mode="contained" style={styles.button}>
            Generate Report
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
  description: {
    marginTop: 8,
    marginBottom: 16,
    color: '#666',
  },
  button: {
    marginTop: 8,
  },
});

export default ReportsDashboardScreen;

