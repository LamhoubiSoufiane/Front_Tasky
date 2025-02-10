import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../assets/colors';

const TaskCalendar = memo(({ selectedDate, onDateSelect }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (date) => {
    return {
      date: date.getDate(),
      day: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
      month: date.toLocaleDateString('fr-FR', { month: 'long' }),
      year: date.getFullYear(),
    };
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      onDateSelect(date);
    }
  };

  const formattedSelectedDate = formatDate(selectedDate || new Date());

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.dateSelector}
        onPress={() => setShowDatePicker(true)}
      >
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>
            {formattedSelectedDate.day} {formattedSelectedDate.date} {formattedSelectedDate.month} {formattedSelectedDate.year}
          </Text>
          <Text style={styles.hint}>Cliquez pour changer la date</Text>
        </View>
        <Icon name="calendar" size={24} color={colors.primary} />
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        showDatePicker && (
          <View style={styles.iosPickerContainer}>
            <View style={styles.iosPickerHeader}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.iosButton}
              >
                <Text style={styles.iosButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleDateChange(null, selectedDate);
                }}
                style={styles.iosButton}
              >
                <Text style={[styles.iosButtonText, styles.confirmButton]}>OK</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="spinner"
              onChange={(event, date) => {
                if (date) onDateSelect(date);
              }}
              style={styles.iosPicker}
            />
          </View>
        )
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dateInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: '#6c757d',
  },
  iosPickerContainer: {
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: '#e9ecef',
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
  },
  iosButton: {
    padding: 8,
  },
  iosButtonText: {
    fontSize: 16,
    color: colors.primary,
  },
  confirmButton: {
    fontWeight: '600',
  },
  iosPicker: {
    backgroundColor: '#fff',
  },
});

export default TaskCalendar;