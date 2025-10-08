import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAuth } from '../contexts/AuthContext';
import { theme } from '../utils/theme';
import Logo from '../components/Logo';

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
import EditDogScreen from '../screens/forms/EditDogScreen';
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
        let iconName: string;

        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            break;
          case 'Kennels':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Dogs':
            iconName = focused ? 'paw' : 'paw-outline';
            break;
          case 'Messages':
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'ellipse';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textSecondary,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
        ...theme.shadows.lg,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
      headerStyle: {
        backgroundColor: theme.colors.surface,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      },
      headerTintColor: theme.colors.text,
      headerTitleStyle: {
        fontWeight: '700',
        fontSize: 20,
      },
      headerLeft: () => (
        <View style={{ marginLeft: 16 }}>
          <Logo size={32} />
        </View>
      ),
      headerTitle: 'Home for Pup',
    })}
  >
    <Tab.Screen 
      name="Dashboard" 
      component={DashboardScreen}
      options={{ 
        title: 'Dashboard',
        tabBarLabel: 'Home'
      }}
    />
    <Tab.Screen 
      name="Kennels" 
      component={KennelsScreen}
      options={{ 
        title: 'Kennels',
        tabBarLabel: 'Kennels'
      }}
    />
    <Tab.Screen 
      name="Dogs" 
      component={DogsScreen}
      options={{ 
        title: 'Dogs',
        tabBarLabel: 'Dogs'
      }}
    />
    <Tab.Screen 
      name="Messages" 
      component={MessagesScreen}
      options={{ 
        title: 'Messages',
        tabBarLabel: 'Messages'
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ 
        title: 'Profile',
        tabBarLabel: 'Profile'
      }}
    />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: theme.colors.surface,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      },
      headerTintColor: theme.colors.primary,
      headerTitleStyle: {
        fontWeight: '700',
        fontSize: 18,
        color: theme.colors.text,
      },
      headerBackTitleVisible: false,
      cardStyle: { backgroundColor: theme.colors.background },
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
    <Stack.Screen 
      name="EditDog" 
      component={EditDogScreen}
      options={{ title: 'Edit Dog' }}
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
