import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAuth } from '../contexts/AuthContext';
import { theme } from '../utils/theme';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import KennelsScreen from '../screens/main/KennelsScreen';
import DogsScreen from '../screens/main/DogsScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Detail Screens
import KennelDetailScreen from '../screens/details/KennelDetailScreen';
import DogDetailScreen from '../screens/details/DogDetailScreen';
import MessageDetailScreen from '../screens/details/MessageDetailScreen';

// Form Screens
import CreateKennelScreen from '../screens/forms/CreateKennelScreen';
import CreateDogScreen from '../screens/forms/CreateDogScreen';
import EditProfileScreen from '../screens/forms/EditProfileScreen';

import LoadingScreen from '../screens/LoadingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
// const Drawer = createDrawerNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        // Temporary text-based icons until vector icons are configured
        let iconText: string;

        switch (route.name) {
          case 'Dashboard':
            iconText = '📊';
            break;
          case 'Kennels':
            iconText = '🏠';
            break;
          case 'Dogs':
            iconText = '🐕';
            break;
          case 'Messages':
            iconText = '💬';
            break;
          case 'Profile':
            iconText = '👤';
            break;
          default:
            iconText = '●';
        }

        return <Text style={{ fontSize: size, color }}>{iconText}</Text>;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textSecondary,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
      },
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{ title: 'Dashboard' }}
    />
    <Tab.Screen 
      name="Kennels" 
      component={KennelsScreen}
      options={{ title: 'My Kennels' }}
    />
    <Tab.Screen 
      name="Dogs" 
      component={DogsScreen}
      options={{ title: 'My Dogs' }}
    />
    <Tab.Screen 
      name="Messages" 
      component={MessagesScreen}
      options={{ title: 'Messages' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.primary,
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen 
      name="MainTabs" 
      component={MainTabs}
      options={{ headerShown: false }}
    />
    
    {/* Kennel Screens */}
    <Stack.Screen 
      name="KennelDetail" 
      component={KennelDetailScreen}
      options={{ title: 'Kennel Details' }}
    />
    <Stack.Screen 
      name="CreateKennel" 
      component={CreateKennelScreen}
      options={{ title: 'Create Kennel' }}
    />
    
    {/* Dog Screens */}
    <Stack.Screen 
      name="DogDetail" 
      component={DogDetailScreen}
      options={{ title: 'Dog Details' }}
    />
    <Stack.Screen 
      name="CreateDog" 
      component={CreateDogScreen}
      options={{ title: 'Add Dog' }}
    />
    
    {/* Message Screens */}
    <Stack.Screen 
      name="MessageDetail" 
      component={MessageDetailScreen}
      options={{ title: 'Message' }}
    />
    
    {/* Profile Screens */}
    <Stack.Screen 
      name="EditProfile" 
      component={EditProfileScreen}
      options={{ title: 'Edit Profile' }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
