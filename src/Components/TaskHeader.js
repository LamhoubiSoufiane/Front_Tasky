import React, { memo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../assets/colors';

const TaskHeader = memo(({ user, progress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Image 
          source={{ uri: user?.avatar }} 
          style={styles.avatar}
        />
        <View>
          <Text style={styles.greeting}>Hello!</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
      </View>
      <View style={styles.progressCard}>
        <Text style={styles.progressText}>Your today's task almost done!</Text>
        <View style={styles.progressCircle}>
          <Text style={styles.progressPercentage}>{progress}%</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressCard: {
    backgroundColor: '#4c669f',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TaskHeader; 