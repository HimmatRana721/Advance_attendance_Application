import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

// Import Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import HomeScreen from './src/screens/main/HomeScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import CalendarScreen from './src/screens/main/CalendarScreen';
import AdminHomeScreen from './src/screens/main/AdminHomeScreen';
import EditProfileScreen from './src/screens/main/EditProfileScreen';
import EmployeeListScreen from './src/screens/main/EmployeeListScreen';
import EmployeeDetailScreen from './src/screens/main/EmployeeDetailScreen';
import QRScannerScreen from './src/screens/main/QRScannerScreen';
import LeaveManagementScreen from './src/screens/main/LeaveManagementScreen';
import AttendanceHistoryScreen from './src/screens/main/AttendanceHistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator Component
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = 'home';
          } else if (route.name === 'Calendar') {
            iconName = 'calendar';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          }
          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 10,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: '#ffffff',
          borderRadius: 25,
          height: 75,
          paddingTop: 12,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 10,
          borderTopWidth: 0,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Admin Tab Navigator Component
function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'AdminDashboard') {
            iconName = 'layout';
          } else if (route.name === 'Calendar') {
            iconName = 'calendar';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          }
          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 10,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: '#ffffff',
          borderRadius: 25,
          height: 75,
          paddingTop: 12,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 10,
          borderTopWidth: 0,
        },
      })}
    >
      <Tab.Screen name="AdminDashboard" component={AdminHomeScreen} />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        initialParams={{ isAdmin: true }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false, // We'll build our own headers in the screens
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="EmployeeList" component={EmployeeListScreen} />
        <Stack.Screen name="EmployeeDetail" component={EmployeeDetailScreen} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
        <Stack.Screen name="LeaveManagement" component={LeaveManagementScreen} />
        <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
