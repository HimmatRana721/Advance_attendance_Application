import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://attendance-api.himmatrana49.workers.dev'; // Live Worker URL
const USER_SESSION_KEY = '@user_session';

// Memory fallback for when AsyncStorage fails (e.g. in some dev environments)
let _memoryStorage = {};

export const saveUser = async (user) => {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Error saving user:', e);
    return { success: false, message: 'Network error. Make sure your worker is deployed.' };
  }
};

export const authenticateUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return null;
    }

    const data = await response.json();
    if (data.success) {
      // Save session locally with fallback
      try {
        await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(data.user));
      } catch (storageError) {
        console.warn('AsyncStorage failed, using memory fallback');
        _memoryStorage[USER_SESSION_KEY] = data.user;
      }
      return data.user;
    }
    return null;
  } catch (e) {
    console.error('Auth error:', e);
    return null;
  }
};

export const getCurrentUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem(USER_SESSION_KEY);
    return userJson != null ? JSON.parse(userJson) : _memoryStorage[USER_SESSION_KEY] || null;
  } catch (e) {
    return _memoryStorage[USER_SESSION_KEY] || null;
  }
};

export const updateLocalUserSession = async (user) => {
  try {
    await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
  } catch (storageError) {
    _memoryStorage[USER_SESSION_KEY] = user;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem(USER_SESSION_KEY);
  } catch (e) {}
  _memoryStorage = {};
};

export const getUsers = async () => {
  return [];
};

export { API_URL };
