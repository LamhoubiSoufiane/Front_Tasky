import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../assets/colors';

const TaskCalendar = memo(({ selectedDate, onDateSelect }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date) => {
    return {
      date: date.getDate(),
      day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      month: date.toLocaleDateString('fr-FR', { month: 'short' }),
      full: date,
    };
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      onDateSelect(date);
    }
  };

  const formattedSelectedDate = formatDate(selectedDate || new Date());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tâches du jour</Text>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.datePickerButtonText}>Choisir une date</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.selectedDateContainer}>
        <TouchableOpacity
          style={[styles.dayContainer, styles.selectedDay]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.monthText, styles.selectedText]}>
            {formattedSelectedDate.month}
          </Text>
          <Text style={[styles.dateText, styles.selectedText]}>
            {formattedSelectedDate.date}
          </Text>
          <Text style={[styles.dayNameText, styles.selectedText]}>
            {formattedSelectedDate.day}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}
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
  datePickerButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  datePickerButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedDateContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  dayContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  monthText: {
    fontSize: 14,
    color: '#666',
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 4,
  },
  dayNameText: {
    fontSize: 14,
    color: '#666',
  },
  selectedText: {
    color: '#fff',
  },
});

export default TaskCalendar;