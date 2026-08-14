import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../../utils/storage';

export default function EmployeeListScreen({ navigation }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchEmployees();
    }, [])
  );

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/employees`);
      const data = await response.json();
      setEmployees(data);
    } catch (e) {
      console.error('Error fetching employees:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  const renderEmployeeItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.employeeCard}
      onPress={() => navigation.navigate('EmployeeDetail', { employee: item })}
    >
      <View style={[
        styles.avatarContainer,
        item.dutyStatus === 'On Duty' ? styles.avatarOnDuty : 
        item.dutyStatus === 'Off Duty' ? styles.avatarOffDuty : {}
      ]}>
        <Feather 
          name="user" 
          size={24} 
          color={
            item.dutyStatus === 'On Duty' ? '#059669' : 
            item.dutyStatus === 'Off Duty' ? '#dc2626' : '#4f46e5'
          } 
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.employeeName}>{item.name}</Text>
        <Text style={styles.employeeRole}>{item.role}</Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusBadge, 
          item.status === 'Present' ? styles.statusPresent : 
          item.status === 'Absent' ? styles.statusAbsent : 
          item.status === 'Late' ? styles.statusLate : 
          item.status === 'Not Checked In' ? styles.statusNotIn :
          styles.statusLeave
        ]}>
          <Text style={[
            styles.statusText,
            item.status === 'Present' ? styles.statusTextPresent : 
            item.status === 'Absent' ? styles.statusTextAbsent : 
            item.status === 'Late' ? styles.statusTextLate : 
            item.status === 'Not Checked In' ? styles.statusTextNotIn :
            styles.statusTextLeave
          ]}>{item.status}</Text>
        </View>

        <View style={[
          styles.dutyBadge,
          item.dutyStatus === 'On Duty' ? styles.dutyOn : styles.dutyOff
        ]}>
          <Text style={[
            styles.dutyText,
            item.dutyStatus === 'On Duty' ? styles.dutyTextOn : styles.dutyTextOff
          ]}>{item.dutyStatus}</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Employees</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <Text style={styles.searchPlaceholder}>Search employees...</Text>
      </View>

      <FlatList
        data={employees}
        renderItem={renderEmployeeItem}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    color: '#9ca3af',
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Increased to avoid floating nav overlap
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOnDuty: { 
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  avatarOffDuty: { 
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  infoContainer: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  employeeRole: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusPresent: { backgroundColor: '#d1fae5' },
  statusAbsent: { backgroundColor: '#fee2e2' },
  statusLate: { backgroundColor: '#fef3c7' },
  statusLeave: { backgroundColor: '#e0e7ff' },
  statusNotIn: { backgroundColor: '#f3f4f6' },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusTextPresent: { color: '#10b981' },
  statusTextAbsent: { color: '#ef4444' },
  statusTextLate: { color: '#f59e0b' },
  statusTextLeave: { color: '#4f46e5' },
  statusTextNotIn: { color: '#6b7280' },
  statusContainer: {
    alignItems: 'flex-end',
    marginRight: 10,
    minWidth: 80,
  },
  dutyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  dutyOn: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  dutyOff: {
    backgroundColor: '#f3f4f6',
    borderColor: '#9ca3af',
  },
  dutyText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dutyTextOn: { color: '#1d4ed8' },
  dutyTextOff: { color: '#4b5563' },
});
