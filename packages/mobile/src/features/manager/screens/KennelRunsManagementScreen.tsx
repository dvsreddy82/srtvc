import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, FAB } from 'react-native-paper';

const KennelRunsManagementScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall">Kennel Runs</Text>
            <Text variant="bodyMedium" style={styles.description}>
              Manage kennel run capacity and configurations
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
      <FAB icon="plus" style={styles.fab} />
    </View>
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
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default KennelRunsManagementScreen;

