import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentUser, API_URL } from '../../utils/storage';

export default function AdminHomeScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
    }, [])
  );

  const fetchStats = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      const response = await fetch(`${API_URL}/admin/overview`);
      const data = await response.json();
      setStats(data);
    } catch (e) {
      console.error('Error fetching admin stats:', e);
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

  const adminStats = stats || { totalEmployees: 0, totalWorkingDays: 0, totalHolidays: 0, presentToday: 0, absentToday: 0, lateToday: 0 };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Admin Dashboard</Text>
            <Text style={styles.name}>{user?.fullName || 'System Manager'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton} 
            onPress={() => navigation.navigate('LeaveManagement')}
          >
            <Feather name="bell" size={24} color="#111827" />
            {adminStats.pendingLeaveCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{adminStats.pendingLeaveCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Hero Card - Total Employees */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Feather name="users" size={28} color="#ffffff" />
            <Text style={styles.heroTitle}>Total Employees</Text>
          </View>
          <Text style={styles.heroValue}>{adminStats.totalEmployees}</Text>
          <Text style={styles.heroSubtitle}>Active on platform</Text>
        </View>

        <Text style={styles.sectionTitle}>Company Overview</Text>

        {/* Stats Grid */}
        <View style={styles.gridContainer}>
          
          {/* Total Working Days */}
          <View style={styles.gridItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#d1fae5' }]}>
              <Feather name="briefcase" size={24} color="#10b981" />
            </View>
            <Text style={styles.gridValue}>{adminStats.totalWorkingDays}</Text>
            <Text style={styles.gridLabel}>Working Days</Text>
          </View>

          {/* Total Holidays */}
          <View style={styles.gridItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
              <Feather name="sun" size={24} color="#ef4444" />
            </View>
            <Text style={styles.gridValue}>{adminStats.totalHolidays}</Text>
            <Text style={styles.gridLabel}>Holidays</Text>
          </View>

          {/* Present Today */}
          <View style={styles.gridItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#e0e7ff' }]}>
              <Feather name="check-circle" size={24} color="#4f46e5" />
            </View>
            <Text style={styles.gridValue}>{adminStats.presentToday}</Text>
            <Text style={styles.gridLabel}>Present Today</Text>
          </View>

          {/* Late Today */}
          <View style={styles.gridItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#fef3c7' }]}>
              <Feather name="clock" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.gridValue}>{adminStats.lateToday}</Text>
            <Text style={styles.gridLabel}>Late Today</Text>
          </View>

          {/* Absent Today */}
          <View style={styles.gridItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
              <Feather name="user-x" size={24} color="#ef4444" />
            </View>
            <Text style={styles.gridValue}>{adminStats.absentToday}</Text>
            <Text style={styles.gridLabel}>Absent Today</Text>
          </View>

        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('EmployeeList')}>
            <Feather name="users" size={20} color="#4f46e5" />
            <Text style={styles.actionButtonText} numberOfLines={1}>View Employees</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Calendar', { isAdmin: true })}>
            <Feather name="calendar" size={20} color="#4f46e5" />
            <Text style={styles.actionButtonText} numberOfLines={1}>Manage Calendar</Text>
          </TouchableOpacity>
        </View>

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
    paddingHorizontal: 24,
    paddingBottom: 120, // Increased to avoid floating nav overlap
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  notificationButton: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ef4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  heroCard: {
    backgroundColor: '#111827', // Darker theme for admin
    borderRadius: 24,
    padding: 28,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 12,
  },
  heroValue: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroSubtitle: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    marginTop: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  gridValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  gridLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center content
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 12, // Reduced padding
    borderRadius: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  actionButtonText: {
    marginLeft: 6, // Slightly closer to icon
    fontSize: 13, // Slightly smaller font to ensure it fits
    fontWeight: '600',
    color: '#374151',
  },
});
