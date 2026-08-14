import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentUser, API_URL } from '../../utils/storage';

export default function HomeScreen({ navigation }) {
  const [filter, setFilter] = useState('monthly');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState('checked_out');

  // Leave Request State
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [leaveDays, setLeaveDays] = useState('');
  const [leaveMessage, setLeaveMessage] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [filter])
  );

  const fetchData = async () => {
    setLoading(true);
    const currentUser = await getCurrentUser();
    setUser(currentUser);

    if (currentUser) {
      try {
        // Fetch stats
        const statsRes = await fetch(`${API_URL}/stats?email=${currentUser.email}`);
        const statsData = await statsRes.json();
        setStats(statsData);

        // Fetch current status
        const statusRes = await fetch(`${API_URL}/attendance/status?user_id=${currentUser.id}`);
        const statusData = await statusRes.json();
        setAttendanceStatus(statusData.status);
      } catch (e) {
        console.error('Error fetching data:', e);
      }
    }
    setLoading(false);
  };

  const handleLeaveSubmit = async () => {
    if (!leaveDays || !leaveMessage) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmittingLeave(true);
    try {
      const response = await fetch(`${API_URL}/leave-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          LQM: leaveMessage,
          leave_days: parseInt(leaveDays)
        })
      });

      if (response.ok) {
        Alert.alert('Success', 'Leave request sent successfully!');
        setLeaveModalVisible(false);
        setLeaveDays('');
        setLeaveMessage('');
      } else {
        Alert.alert('Error', 'Failed to submit leave request');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setSubmittingLeave(false);
    }
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  // Use real stats if available, otherwise fallback to zeros
  const displayStats = stats || { workedDays: 0, absentDays: 0, lateDays: 0, onLeave: 0 };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user.fullName}</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: attendanceStatus === 'checked_in' ? '#d1fae5' : '#f3f4f6' }
          ]}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: attendanceStatus === 'checked_in' ? '#10b981' : '#9ca3af' }
            ]} />
            <Text style={[
              styles.statusText, 
              { color: attendanceStatus === 'checked_in' ? '#065f46' : '#4b5563' }
            ]}>
              {attendanceStatus === 'checked_in' ? 'Working' : 'Off Duty'}
            </Text>
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

        {/* Hero Card - Worked Hours */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Feather name="clock" size={28} color="#ffffff" />
            <Text style={styles.heroTitle}>Total Worked Hours</Text>
          </View>
          <Text style={styles.heroValue}>{displayStats.workedHours || '0h'}</Text>
          <Text style={styles.heroSubtitle}>{filter}</Text>
        </View>

        <Text style={styles.sectionTitle}>Attendance Overview</Text>

        {/* Stats Grid */}
        <View style={styles.gridContainer}>
          
          {/* Worked Days Card */}
          <View style={styles.gridItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#d1fae5' }]}>
              <Feather name="calendar" size={24} color="#10b981" />
            </View>
            <Text style={styles.gridValue}>{displayStats.workedDays}</Text>
            <Text style={styles.gridLabel}>Worked Days</Text>
          </View>

          {/* Late Days Card */}
          <View style={styles.gridItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#fef3c7' }]}>
              <Feather name="alert-circle" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.gridValue}>{displayStats.lateDays}</Text>
            <Text style={styles.gridLabel}>Late Days</Text>
          </View>

          {/* Absent Days Card */}
          <View style={styles.gridItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
              <Feather name="x-circle" size={24} color="#ef4444" />
            </View>
            <Text style={styles.gridValue}>{displayStats.absentDays}</Text>
            <Text style={styles.gridLabel}>Absent Days</Text>
          </View>

          {/* On Leave Card */}
          <View style={styles.gridItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#e0e7ff' }]}>
              <Feather name="coffee" size={24} color="#6366f1" />
            </View>
            <Text style={styles.gridValue}>{displayStats.onLeave}</Text>
            <Text style={styles.gridLabel}>On Leave</Text>
          </View>

        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('QRScanner')}>
            <View style={[styles.actionIconContainer, { backgroundColor: '#eef2ff' }]}>
              <Feather name="maximize" size={20} color="#4f46e5" />
            </View>
            <Text style={styles.actionButtonText}>Scan QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setLeaveModalVisible(true)}>
            <View style={[styles.actionIconContainer, { backgroundColor: '#fff7ed' }]}>
              <Feather name="file-text" size={20} color="#ea580c" />
            </View>
            <Text style={styles.actionButtonText}>Leave Request</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AttendanceHistory')}>
            <View style={[styles.actionIconContainer, { backgroundColor: '#f0fdf4' }]}>
              <Feather name="list" size={20} color="#10b981" />
            </View>
            <Text style={styles.actionButtonText}>View History</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Leave Request Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={leaveModalVisible}
        onRequestClose={() => setLeaveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Leave</Text>
              <TouchableOpacity onPress={() => setLeaveModalVisible(false)}>
                <Feather name="x" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Leave Days</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Number of days"
                keyboardType="numeric"
                value={leaveDays}
                onChangeText={setLeaveDays}
              />

              <Text style={styles.inputLabel}>Message (LQM)</Text>
              <TextInput
                style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Reason for leave..."
                multiline={true}
                numberOfLines={4}
                value={leaveMessage}
                onChangeText={setLeaveMessage}
              />

              <TouchableOpacity 
                style={[styles.submitButton, submittingLeave && { opacity: 0.7 }]} 
                onPress={handleLeaveSubmit}
                disabled={submittingLeave}
              >
                {submittingLeave ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Send Request</Text>
                )}
              </TouchableOpacity>
            </View>
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
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
  heroCard: {
    backgroundColor: '#4f46e5',
    borderRadius: 24,
    padding: 28,
    marginBottom: 32,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    color: '#e0e7ff',
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
    color: '#a5b4fc',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
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
  },
  actionButton: {
    width: '31%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
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
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalBody: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
