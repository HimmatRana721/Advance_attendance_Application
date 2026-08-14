import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getCurrentUser, API_URL } from '../../utils/storage';

export default function AttendanceHistoryScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (!currentUser) return;

      const response = await fetch(`${API_URL}/attendance/logs?user_id=${currentUser.id}`);
      const data = await response.json();
      setLogs(data);
    } catch (e) {
      console.error('Error fetching logs:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    if (isoString === 'AUTO') return 'AUTO (8h)';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return '#10b981';
      case 'Late': return '#f59e0b';
      case 'Absent': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.logBody}>
        <View style={styles.timeInfo}>
          <Feather name="log-in" size={14} color="#10b981" />
          <Text style={styles.timeLabel}>In: </Text>
          <Text style={styles.timeValue}>{formatTime(item.check_in_time)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.timeInfo}>
          <Feather name="log-out" size={14} color="#ef4444" />
          <Text style={styles.timeLabel}>Out: </Text>
          <Text style={styles.timeValue}>{formatTime(item.check_out_time)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance History</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.centered}>
          <Feather name="calendar" size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>No attendance records found</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          renderItem={renderItem}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  listContent: {
    padding: 20,
  },
  logCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  logBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 6,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
  },
});
