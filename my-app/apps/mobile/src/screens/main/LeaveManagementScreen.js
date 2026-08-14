import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { API_URL } from '../../utils/storage';

export default function LeaveManagementScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/leave-requests`);
      const data = await response.json();
      setRequests(data);
    } catch (e) {
      console.error('Error fetching leave requests:', e);
      Alert.alert('Error', 'Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, approval) => {
    try {
      const response = await fetch(`${API_URL}/leave-request/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          approval: approval
        })
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', approval === 1 ? 'Leave request approved!' : 'Leave request rejected.');
        fetchRequests(); // Refresh the list
      } else {
        Alert.alert('Error', data.message || 'Action failed');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.employeeInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.employeeName ? item.employeeName.charAt(0) : '?'}</Text>
          </View>
          <View>
            <Text style={styles.employeeName}>{item.employeeName || 'Unknown'}</Text>
            <Text style={styles.dateText}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</Text>
          </View>
        </View>
        <View style={styles.daysBadge}>
          <Text style={styles.daysBadgeText}>{item.leave_days} Days</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.messageLabel}>Message:</Text>
        <Text style={styles.messageText}>{item.LQM}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]} 
          onPress={() => handleAction(item.id, 0)}
        >
          <Feather name="x" size={18} color="#ef4444" />
          <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.approveButton]} 
          onPress={() => handleAction(item.id, 1)}
        >
          <Feather name="check" size={18} color="#ffffff" />
          <Text style={[styles.actionButtonText, { color: '#ffffff' }]}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Requests</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIconContainer}>
            <Feather name="coffee" size={48} color="#9ca3af" />
          </View>
          <Text style={styles.emptyText}>No pending leave requests</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
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
    padding: 8,
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
    padding: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4f46e5',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  daysBadge: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  daysBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ea580c',
  },
  cardBody: {
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  rejectButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  approveButton: {
    backgroundColor: '#4f46e5',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
