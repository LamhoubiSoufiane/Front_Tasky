import React, { memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../assets/colors';

const TaskCalendar = memo(({ selectedDate, onDateSelect }) => {
  const getDaysInWeek = () => {
    const today = new Date();
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.getDate(),
        day: date.toLocaleString('default', { weekday: 'short' }),
        month: date.toLocaleString('default', { month: 'short' }),
        full: date,
      });
    }
    return days;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Tasks</Text>
        <TouchableOpacity>
          <Text style={styles.dayText}>Day</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.calendar}
      >
        {getDaysInWeek().map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayContainer,
              day.date === selectedDate?.getDate() && styles.selectedDay
            ]}
            onPress={() => onDateSelect(day.full)}
          >
            <Text style={[
              styles.monthText,
              day.date === selectedDate?.getDate() && styles.selectedText
            ]}>{day.month}</Text>
            <Text style={[
              styles.dateText,
              day.date === selectedDate?.getDate() && styles.selectedText
            ]}>{day.date}</Text>
            <Text style={[
              styles.dayNameText,
              day.date === selectedDate?.getDate() && styles.selectedText
            ]}>{day.day}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  dayText: {
    color: colors.primary,
    fontSize: 14,
  },
  calendar: {
    paddingHorizontal: 8,
  },
  dayContainer: {
    width: 60,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  monthText: {
    fontSize: 12,
    color: '#666',
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
  },
  dayNameText: {
    fontSize: 12,
    color: '#666',
  },
  selectedText: {
    color: '#fff',
  },
});

export default TaskCalendar; 