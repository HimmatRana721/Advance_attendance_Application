import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentUser, logout } from '../../utils/storage';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  const employee = user;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header / Avatar */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Feather name="user" size={48} color="#4f46e5" />
          </View>
          <Text style={styles.name}>{employee.fullName}</Text>
          <Text style={styles.role}>{employee.role}</Text>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Feather name="mail" size={20} color="#6b7280" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{employee.email}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Feather name="phone" size={20} color="#6b7280" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{employee.phone}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Feather name="map-pin" size={20} color="#6b7280" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{employee.address}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Feather name="user" size={20} color="#6b7280" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>{employee.gender}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Feather name="calendar" size={20} color="#6b7280" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>{employee.age} years old</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => navigation.navigate('EditProfile', { employee })}
        >
          <Feather name="edit-3" size={20} color="#4f46e5" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 56, // Align with text, skipping icon
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  editButtonText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    marginHorizontal: 24,
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 16,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
