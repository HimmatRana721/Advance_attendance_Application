import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../../utils/storage';

// Helper to get today's date in YYYY-MM-DD format
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to generate default calendar (Saturdays as holidays, rest as working days)
const generateDefaultCalendar = (startYear, endYear) => {
  const defaults = {};
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const todayStr = getTodayString();
        const isToday = dateString === todayStr;
        
        if (date.getDay() === 6) { // 6 is Saturday
          defaults[dateString] = {
            customStyles: {
              container: { 
                backgroundColor: 'transparent',
              },
              text: { 
                color: '#ef4444', 
                fontWeight: 'bold',
                fontSize: isToday ? 24 : 16
              }
            }
          };
        } else {
          defaults[dateString] = {
            customStyles: {
              container: { 
                backgroundColor: 'transparent',
              },
              text: { 
                color: '#10b981', 
                fontWeight: 'bold',
                fontSize: isToday ? 24 : 16
              }
            }
          };
        }
      }
    }
  }
  return defaults;
};

export default function CalendarScreen({ route }) {
  const [isAdmin, setIsAdmin] = useState(route.params?.isAdmin ?? false);
  const [markedDates, setMarkedDates] = useState(() => generateDefaultCalendar(2024, 2030));
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchCalendar();
    }, [])
  );

  const fetchCalendar = async () => {
    try {
      const response = await fetch(`${API_URL}/calendar`);
      const events = await response.json();
      
      // Get base calendar with defaults
      const defaults = generateDefaultCalendar(2024, 2030);
      const todayStr = getTodayString();

      // Overlay DB events
      events.forEach(event => {
        const isToday = event.date === todayStr;
        defaults[event.date] = {
          customStyles: {
            container: { backgroundColor: 'transparent' },
            text: { 
              color: event.status === 'holiday' ? '#ef4444' : '#10b981', 
              fontWeight: 'bold',
              fontSize: isToday ? 24 : 16
            }
          }
        };
      });

      setMarkedDates(defaults);
    } catch (e) {
      console.error('Error fetching calendar:', e);
    } finally {
      setLoading(false);
    }
  };

  const onDayPress = (day) => {
    if (!isAdmin) return;
    
    const todayStr = getTodayString();
    if (day.dateString < todayStr) {
      Alert.alert("Action Not Allowed", "You cannot edit the status of past days.");
      return;
    }

    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  const handleSetStatus = async (status) => {
    if (!selectedDate) return;

    try {
      const response = await fetch(`${API_URL}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          status: status,
          updated_by: 'admin'
        })
      });
      
      if (response.ok) {
        fetchCalendar();
      } else {
        Alert.alert("Error", "Failed to update calendar status.");
      }
    } catch (e) {
      console.error('Error updating calendar:', e);
      Alert.alert("Error", "Something went wrong.");
    }
    
    setModalVisible(false);
    setSelectedDate(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Calendar</Text>
      </View>

      <Text style={styles.subtitle}>
        {isAdmin 
          ? 'As an Admin, you can tap any date to mark it as a Holiday or Working Day.' 
          : 'View your scheduled working days and holidays below.'}
      </Text>

      {/* Calendar Component */}
      <View style={styles.calendarContainer}>
        <Calendar
          markingType={'custom'}
          onDayPress={onDayPress}
          markedDates={markedDates}
          hideExtraDays={true}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#6b7280',
            selectedDayBackgroundColor: '#4f46e5',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#4f46e5',
            dayTextColor: '#111827',
            textDisabledColor: '#d1d5db',
            arrowColor: '#4f46e5',
            monthTextColor: '#111827',
            indicatorColor: '#4f46e5',
            textDayFontWeight: '500',
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
        />
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendText}>Working Day</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>Holiday</Text>
        </View>
      </View>

      {/* Admin Edit Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Status</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDateText}>Date: {selectedDate}</Text>

            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#10b981' }]} 
              onPress={() => handleSetStatus('working')}
            >
              <Feather name="check-circle" size={20} color="#ffffff" />
              <Text style={styles.modalButtonText}>Mark as Working Day</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#ef4444' }]} 
              onPress={() => handleSetStatus('holiday')}
            >
              <Feather name="calendar" size={20} color="#ffffff" />
              <Text style={styles.modalButtonText}>Mark as Holiday</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' }]} 
              onPress={() => handleSetStatus('clear')}
            >
              <Feather name="trash-2" size={20} color="#6b7280" />
              <Text style={[styles.modalButtonText, { color: '#4b5563' }]}>Clear Status</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  roleToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleToggleAdmin: {
    backgroundColor: '#fee2e2',
  },
  roleToggleEmployee: {
    backgroundColor: '#e0e7ff',
  },
  roleToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  calendarContainer: {
    marginHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
    paddingBottom: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalDateText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
