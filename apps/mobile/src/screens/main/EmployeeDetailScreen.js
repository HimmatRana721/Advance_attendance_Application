import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { API_URL } from '../../utils/storage';

export default function EmployeeDetailScreen({ navigation, route }) {
  const { employee } = route.params;
  const [filter, setFilter] = useState('monthly');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [employee.email]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/stats?email=${employee.email}`);
      const data = await response.json();
      setStats(data);
    } catch (e) {
      console.error('Error fetching employee stats:', e);
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

  const displayStats = stats || { workedDays: 0, absentDays: 0, lateDays: 0, onLeave: 0, workedHours: '0h' };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Employee Stats</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={40} color="#4f46e5" />
          </View>
          <View>
            <Text style={styles.employeeName}>{employee.name}</Text>
            <Text style={styles.employeeRole}>{employee.role}</Text>
          </View>
        </View>

        {/* Filter Toggle */}
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'monthly' && styles.filterButtonActive]}
            onPress={() => setFilter('monthly')}
          >
            <Text style={[styles.filterText, filter === 'monthly' && styles.filterTextActive]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'yearly' && styles.filterButtonActive]}
            onPress={() => setFilter('yearly')}
          >
            <Text style={[styles.filterText, filter === 'yearly' && styles.filterTextActive]}>Yearly</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Total Working Hours</Text>
            <Text style={styles.heroValue}>{displayStats.workedHours}</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.statCard, { backgroundColor: '#d1fae5' }]}>
              <Feather name="calendar" size={24} color="#10b981" />
              <Text style={styles.statValue}>{displayStats.workedDays}</Text>
              <Text style={styles.statLabel}>Worked Days</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#fee2e2' }]}>
              <Feather name="user-x" size={24} color="#ef4444" />
              <Text style={styles.statValue}>{displayStats.absentDays}</Text>
              <Text style={styles.statLabel}>Absent Days</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
              <Feather name="clock" size={24} color="#f59e0b" />
              <Text style={styles.statValue}>{displayStats.lateDays}</Text>
              <Text style={styles.statLabel}>Late Days</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#e0e7ff' }]}>
              <Feather name="coffee" size={24} color="#4f46e5" />
              <Text style={styles.statValue}>{displayStats.onLeave}</Text>
              <Text style={styles.statLabel}>On Leave</Text>
            </View>
          </View>
        </View>

        {/* Contact Admin / Notes */}
        <TouchableOpacity style={styles.contactButton}>
          <Feather name="mail" size={20} color="#ffffff" />
          <Text style={styles.contactButtonText}>Send Internal Message</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    paddingBottom: 120, // Increased to avoid floating nav overlap
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  employeeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  employeeRole: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#111827',
    fontWeight: '700',
  },
  gridContainer: {
    paddingHorizontal: 24,
  },
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  heroLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  heroValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
    marginHorizontal: 24,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});
