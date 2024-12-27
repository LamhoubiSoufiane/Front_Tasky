import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../assets/colors';

const TeamProjectsTab = ({ team }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>La gestion des projets sera bientôt disponible!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default TeamProjectsTab;
